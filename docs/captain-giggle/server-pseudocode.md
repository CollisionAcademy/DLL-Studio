# Adult production API — pseudocode only

This endpoint is **not implemented or deployed**. The child-facing companion has no API credentials and makes no generation calls. The authenticated producer tool is a separate surface. A generator must verify the current official API contracts for its selected GPT and FAL models before implementation; the functions below are abstract adapters, not claimed SDK methods.

```text
# Server environment only, never NEXT_PUBLIC_*, client bundles or public assets
FAL_KEY=YOUR_FAL_API_KEY
OPENAI_API_KEY=YOUR_OPENAI_API_KEY

POST /internal/production/jobs
  producer = requireAuthenticatedAdultProducer(request)
  requireRole(producer, "animation_producer")
  enforceCSRFAndSameOrigin(request)
  enforceBodyLimit(request, 16 KiB)
  enforceProducerRateLimit(producer)
  input = parseStrictJSON(request, {
    projectId, sceneId, shotId, branchId?, approvedBudgetId, idempotencyKey
  })
  rejectUnknownFields(input)
  rejectChildMessagesOrArbitraryPrompts(input)
  scene = loadVersionedApprovedScene(input.projectId, input.sceneId)
  shot = getApprovedShot(scene, input.shotId, input.branchId)
  requireApprovedCharacterReferences(scene.characters)
  requireRecordedRightsForEveryReference(shot.references)
  requirePassedEditorialReview(shot)
  existingJob = findProducerJobByIdempotencyKey(producer, input.idempotencyKey)
  if existingJob: return sanitizedJobStatus(existingJob)

  # Price/duration/fields come from a reviewed endpoint configuration.
  providerConfig = loadCurrentReviewedEndpointConfig(shot.productionProfile)
  validateInputsAgainstActualProviderSchema(providerConfig, shot)
  maxCost = computeWorstCaseCost(providerConfig, shot, retries=0)
  atomicallyReserveApprovedBudget(input.approvedBudgetId, maxCost)
  job = createJobWithUniqueIdempotencyConstraint(producer, input)
  enqueue(job)
  return 202 {jobId: opaqueId(job), status: "queued"}

WORKER(job)
  scene, shot = loadImmutableApprovedJobInputs(job)
  # Optional GPT step for a producer-requested revision only.
  # Never silently rewrite the approved script during video rendering.
  if job.mode == "draft_revision":
    candidate = gptAdapter.generateStructuredJSON(
      credential=env.OPENAI_API_KEY,
      reviewedModelConfig=currentConfig,
      instruction="Return a draft matching the approved schema and age constraints.",
      input=approvedNonPersonalStoryMaterial,
      outputSchema=sceneSchema,
      retentionOptions=reviewedProviderRetentionOptions,
      timeout=boundedTimeout
    )
    validateSchemaAndTiming(candidate)
    scanForUnsafeOrUnsupportedContent(candidate)
    savePrivateDraft(candidate)
    markAwaitingHumanApproval(job)
    return

  request = buildDocumentedFALPayload(
    endpoint=providerConfig.endpoint,
    prompt=shot.prompt,
    approvedReferenceAssets=shot.references,
    duration=providerConfig.supportedDuration,
    aspect=providerConfig.supportedAspect,
    # Include negative_prompt only if that endpoint supports it.
    negativePromptIfSupported=shot.negativePrompt
  )
  providerJob = falAdapter.submit(
    credential=env.FAL_KEY,
    request=request,
    timeout=boundedTimeout
  )
  storeProviderJobIdPrivately(job, providerJob.id)
  # Do not automatically resubmit after ambiguous timeout.
  # Reconcile the provider job first to prevent duplicate charges.
  output = awaitBoundedProviderJob(providerJob, cancellationSupport=true)
  validateExpectedMediaTypeDimensionsDuration(output)
  downloadOnlyFromReviewedProviderOutputHosts(output)
  # Reject redirects to private network addresses, arbitrary URLs and oversize files.
  scanAndStoreOutputPrivately(output)
  recordPromptHashReferencesLicenseModelVersionActualUsage(job)
  settleBudgetReservationAgainstActualCharge(job)
  markAwaitingHumanVisualAndAudioReview(job)
  # Never publish automatically. No secrets, signed source URLs or raw provider
  # exception bodies go to the public app or ordinary logs.

GET /internal/production/jobs/{jobId}
  producer = requireAuthenticatedAdultProducer(request)
  requireJobOwnershipOrProjectRole(producer, jobId)
  return {status, reviewedPreviewURL?, billedUsageSummary?}
```

Keep reference assets private until rights and identity review. Serve a reviewed final MP4 through a controlled static media route only after adult approval. Do not install this endpoint into the existing public character-chat route. Existing local credentials are not read, printed, copied into this package or used for generation.

Retries, cancellation, exact resolution and reference-image behavior depend on the selected provider. Validate current provider documentation rather than inventing API paths. A provider accepting a request does not establish copyright clearance, child suitability or monetization approval.
