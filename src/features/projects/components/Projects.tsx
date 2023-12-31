import clsx from "clsx";
import Link from "next/link";
import { XIcon } from "lucide-react";

import { ProjectAvatar } from "./ProjectAvatar";
import { ProjectBanner } from "./ProjectBanner";
import { Heading } from "~/components/ui/Heading";
import { Skeleton } from "~/components/ui/Skeleton";
import { InfiniteLoading } from "~/components/InfiniteLoading";
import { Button } from "~/components/ui/Button";
import { useProjectMetadata, useProjects } from "../hooks/useProjects";
import { useSelectProjects } from "../hooks/useSelectProjects";
import { ProjectSelectButton } from "./ProjectSelectButton";
import { type Attestation } from "~/utils/fetchAttestations";
import { ImpactCategories } from "./ImpactCategories";
import { getAppState } from "~/utils/state";
import { useResults } from "~/hooks/useResults";
import { formatNumber } from "~/utils/formatNumber";
import { config } from "~/config";
import { SortFilter } from "~/components/SortFilter";
import { useFilter } from "~/features/filter/hooks/useFilter";

export function Projects() {
  const projects = useProjects();
  const select = useSelectProjects();
  const results = useResults();
  const { data: filter } = useFilter("projects");

  return (
    <div>
      <div
        className={clsx(
          "sticky top-4 z-20 mb-4 mt-4 flex justify-end gap-4 lg:-mt-8",
          {
            ["invisible"]: !select.count,
          },
        )}
      >
        <Button
          variant="primary"
          onClick={select.add}
          disabled={!select.count}
          className="w-full lg:w-72"
        >
          Add {select.count} projects to ballot
        </Button>
        <Button size="icon" onClick={select.reset}>
          <XIcon />
        </Button>
      </div>

      <div className="flex justify-end">
        <SortFilter
          type="projects"
          sortOptions={["name_asc", "name_desc", "time_asc", "time_desc"]}
          filter={filter}
        />
      </div>
      <InfiniteLoading
        {...projects}
        renderItem={(item, { isLoading }) => {
          return (
            <Link
              key={item.id}
              href={`/projects/${item.id}`}
              className={clsx("relative", { ["animate-pulse"]: isLoading })}
            >
              {!isLoading && getAppState() === "VOTING" ? (
                <div className="absolute right-2 top-[100px] z-10 -mt-2">
                  <ProjectSelectButton
                    state={select.getState(item.id)}
                    onClick={(e) => {
                      e.preventDefault();
                      select.toggle(item.id);
                    }}
                  />
                </div>
              ) : null}
              {!results.isLoading && getAppState() === "RESULTS" ? (
                <div className="absolute right-2 top-[100px] z-10 -mt-2 rounded bg-gray-900 p-1 text-sm">
                  <span className="font-bold">
                    {formatNumber(results.data?.projects?.[item.id])}
                  </span>{" "}
                  {config.tokenName}
                </div>
              ) : null}
              <ProjectItem isLoading={isLoading} attestation={item} />
            </Link>
          );
        }}
      />
    </div>
  );
}

export function ProjectItem({
  attestation,
  isLoading,
}: {
  attestation: Attestation;
  isLoading: boolean;
}) {
  const metadata = useProjectMetadata(attestation?.metadataPtr);

  return (
    <article
      data-testid={`project-${attestation.id}`}
      className="group rounded-2xl border border-gray-200 p-2 hover:border-primary-500 dark:border-gray-700 dark:hover:border-primary-500"
    >
      <div className="opacity-70 transition-opacity group-hover:opacity-100">
        <ProjectBanner profileId={attestation?.recipient} />
        <ProjectAvatar
          rounded="full"
          className="-mt-8 ml-4"
          profileId={attestation?.recipient}
        />
      </div>
      <Heading className="truncate" size="lg" as="h3">
        <Skeleton isLoading={isLoading}>{attestation?.name}</Skeleton>
      </Heading>
      <div className="mb-2">
        <p className="line-clamp-2 h-10 text-sm dark:text-gray-300">
          <Skeleton isLoading={isLoading} className="w-full">
            {metadata.data?.bio}
          </Skeleton>
        </p>
      </div>
      <Skeleton isLoading={isLoading} className="w-[100px]">
        <ImpactCategories tags={metadata.data?.impactCategory} />
      </Skeleton>
    </article>
  );
}
