import { ChecklistItem, ProjectChecklistResult, ReadinessSummary } from "./types";

export function calculateReadiness(
  items: ChecklistItem[],
  results: ProjectChecklistResult[]
): ReadinessSummary {
  const resultMap = new Map<string, ProjectChecklistResult>();
  results.forEach((r) => resultMap.set(r.itemId, r));

  let passedCount = 0;
  let failedCount = 0;
  let untestedCount = 0;
  let blockedCount = 0;
  let notApplicableCount = 0;
  let criticalTotal = 0;
  let criticalPassed = 0;
  let criticalFailedCount = 0;
  let highFailedCount = 0;
  let mediumFailedCount = 0;
  let lowFailedCount = 0;
  const blockers: string[] = [];

  for (const item of items) {
    const res = resultMap.get(item.id);
    const status = res ? res.status : "not_tested";

    if (item.criticality === "Critical") {
      criticalTotal++;
      if (status === "passed") {
        criticalPassed++;
      }
    }

    if (status === "passed") {
      passedCount++;
    } else if (status === "failed") {
      failedCount++;
      if (item.criticality === "Critical") {
        criticalFailedCount++;
        blockers.push(`Critical failure: ${item.title}`);
      } else if (item.criticality === "High") {
        highFailedCount++;
      } else if (item.criticality === "Medium") {
        mediumFailedCount++;
      } else {
        lowFailedCount++;
      }
    } else if (status === "blocked") {
      blockedCount++;
      blockers.push(`Explicit blocker: ${item.title}`);
    } else if (status === "not_applicable") {
      notApplicableCount++;
    } else {
      untestedCount++;
    }
  }

  const totalChecks = items.length;
  const applicableChecks = Math.max(1, totalChecks - notApplicableCount);
  const completedChecks = passedCount + failedCount + blockedCount + notApplicableCount;

  const percentPassed = Math.round((passedCount / applicableChecks) * 100);
  const percentCompleted = Math.round((completedChecks / Math.max(1, totalChecks)) * 100);

  let verdict: ReadinessSummary["verdict"] = "in_progress";
  let verdictLabel = "IN PROGRESS";
  let canDeploy = false;

  if (criticalFailedCount > 0 || blockedCount > 0) {
    verdict = "blocked";
    verdictLabel = "BLOCKED – CRITICAL DEFECTS";
    canDeploy = false;
  } else if (highFailedCount > 0) {
    verdict = "rejected";
    verdictLabel = "ACTION REQUIRED – HIGH SEVERITY FAILURES";
    canDeploy = false;
  } else if (untestedCount > 0) {
    verdict = "in_progress";
    verdictLabel = "IN PROGRESS – UNTESTED CHECKS REMAIN";
    canDeploy = false;
  } else if (failedCount > 0) {
    verdict = "rejected";
    verdictLabel = "DEFECTS IDENTIFIED";
    canDeploy = false;
  } else {
    verdict = "production_ready";
    verdictLabel = "PRODUCTION READY – ALL CHECKS PASSED";
    canDeploy = true;
  }

  return {
    totalChecks,
    passedCount,
    failedCount,
    untestedCount,
    blockedCount,
    notApplicableCount,
    percentPassed,
    percentCompleted,
    criticalTotal,
    criticalPassed,
    criticalFailedCount,
    highFailedCount,
    mediumFailedCount,
    lowFailedCount,
    verdict,
    verdictLabel,
    canDeploy,
    blockers,
  };
}
