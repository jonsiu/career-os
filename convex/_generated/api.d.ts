/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as __tests___test_helpers from "../__tests__/test-helpers.js";
import type * as analyses from "../analyses.js";
import type * as analysisResults from "../analysisResults.js";
import type * as files from "../files.js";
import type * as jobCategories from "../jobCategories.js";
import type * as jobs from "../jobs.js";
import type * as plans from "../plans.js";
import type * as resumes from "../resumes.js";
import type * as skills from "../skills.js";
import type * as transitions from "../transitions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "__tests__/test-helpers": typeof __tests___test_helpers;
  analyses: typeof analyses;
  analysisResults: typeof analysisResults;
  files: typeof files;
  jobCategories: typeof jobCategories;
  jobs: typeof jobs;
  plans: typeof plans;
  resumes: typeof resumes;
  skills: typeof skills;
  transitions: typeof transitions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
