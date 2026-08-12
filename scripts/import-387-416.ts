import { closeGen4Import, runImport387416 } from "./import-gen4";

runImport387416()
  .then(async (result) => {
    console.log(
      JSON.stringify(
        {
          batch: "387-416",
          planRows: result.plan.length,
          releasedRows: result.plan.filter((row) => row.released).length,
        },
        null,
        2,
      ),
    );
    await closeGen4Import(result);
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
