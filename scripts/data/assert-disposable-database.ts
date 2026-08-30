import "dotenv/config";
import { assertDisposableDatabase, getDatabaseUrl } from "../../src/lib/database";

assertDisposableDatabase(getDatabaseUrl());
