"""
Chat Spike V2 — 6-platform benchmark test client
Runs against VPS :8001 test server, logs results locally.
Usage: python3 scripts/chat-spike-test.py
"""
import asyncio, json, time, sys, os
from pathlib import Path

import httpx

VPS_HOST = "45.76.111.175"
VPS_PORT = 8001
VPS_BASE = f"http://{VPS_HOST}:{VPS_PORT}"

PLATFORMS = ["deepseek", "zhipu", "qwen", "ernie", "kimi", "doubao"]
QUESTIONS = [
    "小米最新手机有哪些",
    "推荐国产新能源车",
    "什么是 GEO 优化",
    "法国护肤品牌推荐",
    "中国母婴品牌排名",
]

ROUNDS_VPS = 5
DELAY_BETWEEN_CALLS = 2  # seconds
DELAY_BETWEEN_PLATFORMS = 10  # seconds
TIMEOUT = 60  # seconds per call

LOG_DIR = Path(__file__).parent.parent / "spike-data"
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / "benchmark-results.jsonl"


async def call_platform(client: httpx.AsyncClient, platform: str, question: str, round_num: int) -> dict:
    """Call VPS test server, parse SSE, return timing dict."""
    t0 = int(time.time() * 1000)  # client send time
    result = {
        "platform": platform,
        "question": question,
        "round": round_num,
        "t0": t0,
        "t1": None, "t2": None, "t3": None, "t4": None,
        "t5": None,
        "first_token_ms": None,
        "total_ms": None,
        "total_tokens": 0,
        "full_text": "",
        "error": None,
    }

    try:
        async with client.stream(
            "POST",
            f"{VPS_BASE}/api/chat/{platform}",
            json={"message": question},
            timeout=TIMEOUT,
        ) as resp:
            if resp.status_code != 200:
                result["error"] = f"HTTP {resp.status_code}"
                return result

            buffer = ""
            async for chunk in resp.aiter_text():
                buffer += chunk
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    line = line.strip()
                    if not line or not line.startswith("data: "):
                        continue
                    try:
                        data = json.loads(line[6:])
                    except json.JSONDecodeError:
                        continue

                    if "token" in data:
                        result["full_text"] += data["token"]
                        result["total_tokens"] += 1

                    # Capture server-side timestamps
                    for key in ("t1", "t2", "t3", "t4", "first_token_ms", "total_ms"):
                        if key in data and data[key] is not None:
                            result[key] = data[key]

                    if data.get("error"):
                        result["error"] = data["error"]

                    if data.get("done"):
                        result["t5"] = int(time.time() * 1000)

    except Exception as e:
        result["error"] = str(e)

    if result["t5"] is None:
        result["t5"] = int(time.time() * 1000)

    # Compute latency segments
    if result["t1"] and result["t3"]:
        result["L1_uplink_ms"] = result["t1"] - result["t0"]
        result["L2_proxy_ms"] = result["t2"] - result["t1"] if result["t2"] else None
        result["L3_first_token_ms"] = result["t3"] - result["t2"] if result["t2"] else None
        result["L4_stream_ms"] = result["t4"] - result["t3"] if result["t4"] else None
        result["L5_downlink_ms"] = result["t5"] - result["t4"] if result["t4"] else None

    return result


async def run_benchmark():
    total_calls = len(PLATFORMS) * len(QUESTIONS) * ROUNDS_VPS
    print(f"=== Chat Spike V2 Benchmark ===")
    print(f"Platforms: {len(PLATFORMS)}, Questions: {len(QUESTIONS)}, Rounds: {ROUNDS_VPS}")
    print(f"Total calls: {total_calls}")
    print(f"Estimated time: ~{total_calls * (DELAY_BETWEEN_CALLS + 5) // 60} min")
    print(f"Log: {LOG_FILE}")
    print()

    # Health check
    async with httpx.AsyncClient() as client:
        try:
            r = await client.get(f"{VPS_BASE}/health", timeout=10)
            health = r.json()
            print(f"Server health: {health}")
        except Exception as e:
            print(f"ERROR: Cannot reach VPS server: {e}")
            sys.exit(1)

    results = []
    call_num = 0

    async with httpx.AsyncClient() as client:
        for pi, platform in enumerate(PLATFORMS):
            if pi > 0:
                print(f"\n--- Waiting {DELAY_BETWEEN_PLATFORMS}s before next platform ---")
                await asyncio.sleep(DELAY_BETWEEN_PLATFORMS)

            print(f"\n{'='*50}")
            print(f"Platform: {platform} ({pi+1}/{len(PLATFORMS)})")
            print(f"{'='*50}")

            for round_num in range(1, ROUNDS_VPS + 1):
                for qi, question in enumerate(QUESTIONS):
                    call_num += 1
                    print(f"  [{call_num}/{total_calls}] R{round_num} Q{qi+1}: {question[:20]}...", end=" ", flush=True)

                    result = await call_platform(client, platform, question, round_num)
                    results.append(result)

                    # Write to log immediately
                    with open(LOG_FILE, "a") as f:
                        f.write(json.dumps(result, ensure_ascii=False) + "\n")

                    if result["error"]:
                        print(f"ERROR: {result['error'][:50]}")
                    else:
                        ft = result.get("first_token_ms", "?")
                        tt = result.get("total_ms", "?")
                        print(f"first={ft}ms total={tt}ms tokens={result['total_tokens']}")

                    await asyncio.sleep(DELAY_BETWEEN_CALLS)

    # Summary
    print(f"\n{'='*60}")
    print(f"BENCHMARK COMPLETE — {len(results)} calls")
    print(f"{'='*60}")

    success = [r for r in results if not r["error"]]
    errors = [r for r in results if r["error"]]
    print(f"Success: {len(success)}, Errors: {len(errors)}")

    if errors:
        print("\nErrors by platform:")
        from collections import Counter
        for platform, count in Counter(r["platform"] for r in errors).items():
            print(f"  {platform}: {count} errors")

    for platform in PLATFORMS:
        p_results = [r for r in success if r["platform"] == platform]
        if not p_results:
            print(f"\n{platform}: NO successful calls")
            continue
        ft_vals = [r["first_token_ms"] for r in p_results if r.get("first_token_ms")]
        tt_vals = [r["total_ms"] for r in p_results if r.get("total_ms")]
        if ft_vals:
            ft_vals.sort()
            p50 = ft_vals[len(ft_vals)//2]
            p95 = ft_vals[int(len(ft_vals)*0.95)]
            print(f"\n{platform} (n={len(p_results)}):")
            print(f"  First token — P50: {p50}ms, P95: {p95}ms, min: {min(ft_vals)}ms, max: {max(ft_vals)}ms")
        if tt_vals:
            tt_vals.sort()
            p50 = tt_vals[len(tt_vals)//2]
            p95 = tt_vals[int(len(tt_vals)*0.95)]
            print(f"  Total       — P50: {p50}ms, P95: {p95}ms, min: {min(tt_vals)}ms, max: {max(tt_vals)}ms")

    print(f"\nFull results: {LOG_FILE}")


if __name__ == "__main__":
    asyncio.run(run_benchmark())
