export interface ReleasePublishRef {
  ref: string;
  refType: string;
  refName: string;
  defaultBranch: string;
}

export function assertSafeReleasePublishRef({
  ref,
  refType,
  refName,
  defaultBranch,
}: ReleasePublishRef) {
  if (!ref || !refType || !refName || !defaultBranch) {
    throw new Error("Release publication requires a branch ref and default branch metadata.");
  }
  if (refType !== "branch") {
    throw new Error(`Release publication is only allowed from a branch ref, received ${refType}.`);
  }
  if (refName === defaultBranch) {
    throw new Error(`Release publication refuses the repository default branch ${defaultBranch}.`);
  }
  if (ref !== `refs/heads/${refName}`) {
    throw new Error(`Release publication ref is not a branch ref: ${ref}.`);
  }
}

const scriptPath = process.argv[1]?.replaceAll("\\", "/");
if (scriptPath?.endsWith("/scripts/verify-release-ref.ts")) {
  try {
    assertSafeReleasePublishRef({
      ref: process.env.RELEASE_REF ?? "",
      refType: process.env.RELEASE_REF_TYPE ?? "",
      refName: process.env.RELEASE_REF_NAME ?? "",
      defaultBranch: process.env.DEFAULT_BRANCH ?? "",
    });
    console.log(`Release publication ref verified: ${process.env.RELEASE_REF_NAME}.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
