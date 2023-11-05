/* eslint-disable  @typescript-eslint/no-explicit-any */

import { Octokit } from "@octokit/action";
import { Endpoints } from "@octokit/types";
import * as core from "@actions/core";

type listCodespacesParams = Endpoints["GET /user/codespaces"]["parameters"];
type deleteCodespacesParams =
  Endpoints["DELETE /user/codespaces/{codespace_name}"]["parameters"];

const checkFor202 = (x: number): boolean => x === 202;

const run = async (): Promise<void> => {
  const octokit = new Octokit();

  /* A user can only have a max of 30 codespaces, but, there is a way to get this increased, so setting to 100 */
  const listCodespacesForAuthenticatedUserParams: listCodespacesParams = {
    per_page: 100,
  };

  const {
    data: { codespaces, total_count },
  } = (await octokit.request(
    "GET /user/codespaces",
    listCodespacesForAuthenticatedUserParams,
  )) as any;

  core.debug(
    `total number of codespaces for the authenticated user: ${total_count}`,
  );

  core.debug(`Codespaces found: ${JSON.stringify(codespaces)}`);

  const arr = [] as number[];

  if (total_count > 0) {
    const filterd = codespaces.filter((codespace: any) => {
      return (
        !codespace.git_status.has_unpushed_changes &&
        !codespace.git_status.has_uncommitted_changes
      );
    });

    core.debug(
      `total count after removing the codespaces with unpublished and uncomitted changes: ${filterd.length}`,
    );

    filterd.forEach(async (codespace: any) => {
      const deleteCodespaceParams: deleteCodespacesParams = {
        codespace_name: codespace.name,
      };
      const { status } = (await octokit.request(
        "DELETE /user/codespaces/{codespace_name}",
        deleteCodespaceParams,
      )) as any;
      arr.push(status);
    });
  }

  arr.every(checkFor202) || arr.length === 0
    ? core.setOutput("success", "true")
    : core.setOutput("success", "false");
};

run();
