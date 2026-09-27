export function videoStateLabel(state: string) {
  const labels: Record<string, string> = {
    moderating: "Submission received · preparing your story",
    queued: "Submission received · waiting to create",
    submitting: "Creating your adventure",
    processing: "Creating your adventure · it will appear here automatically",
    review: "Awaiting a team check",
    ready: "Ready to watch",
    failed: "Could not finish · credit returned",
    rejected: "Story could not be accepted · credit returned",
    uncertain: "We’re checking this request · no duplicate charge",
  };
  return labels[state] || "Checking your video";
}
export function hasPendingVideos(videos: { state: string }[]) {
  return videos.some((v) =>
    ["moderating", "queued", "submitting", "processing"].includes(v.state),
  );
}
