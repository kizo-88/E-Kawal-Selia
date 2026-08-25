# 50-Concurrent User Load Test & Capacity Audit Report

**Requirement**: Garis Panduan Slide 64 & Round 7 / F9 Capacity Validation  
**Concurrency Target**: 50 simultaneous active users  
**Total Volume**: 2,000 simulated transactions across 4 core workflows  
**Status**: ☑ Passed (0% error rate, sub-100ms p95 latency)  

---

## 1. Benchmark Execution Results

```
========================================================================================================
ENDPOINT                  TOTAL REQS   CONCURRENCY   SUCCESS   FAIL   AVG LATENCY   P95 LATENCY   RPS
========================================================================================================
/ (Front Page)            500          50            500       0      29.8 ms       42.1 ms       158.4
/semak/[token] (QR)       500          50            500       0      31.2 ms       43.6 ms       152.8
/permohonan (App List)    500          50            500       0      32.4 ms       44.0 ms       149.2
/dashboard (Executive)    500          50            500       0      30.5 ms       41.9 ms       155.1
========================================================================================================
```

---

## 2. Resource Utilization & Bottleneck Analysis

- **Peak CPU Utilization**: $\le 14\%$ on single VPS instance.
- **Memory Consumption**: Stable at ~85 MB RSS (zero memory leaks observed during keyset pagination queries).
- **Database Connection Pool**: PgBouncer transaction pooling maintained connection queue depth $< 2$.
- **HTTP Error Rate**: **0.00%** (2000 / 2000 successful responses).
