import {
  compact,
  get,
  isArray,
  isEqualWith,
  pullAllBy,
  sortBy,
  zip,
} from "lodash-es";
import {
  ArtifactProps,
  type ApplicationDTO,
  type EnsembleDocument,
} from "./dto";

export const diffApplications = (
  appA: ApplicationDTO,
  appB: ApplicationDTO,
): [EnsembleDocument?, EnsembleDocument?][] => {
  const differences: [EnsembleDocument?, EnsembleDocument?][] = [];
  ArtifactProps.forEach((prop) => {
    const docsA = get(appA, prop) as EnsembleDocument[] | EnsembleDocument;
    const docsB = get(appB, prop) as EnsembleDocument[] | EnsembleDocument;
    if (isArray(docsA) && isArray(docsB)) {
      const sortedDocsA = sortBy(
        docsA.filter((doc) => Boolean(doc.isArchived)),
        "id",
      );
      const sortedDocsB = sortBy(
        docsB.filter((doc) => Boolean(doc.isArchived)),
        "id",
      );
      // This mutates array so they only contain docs with same ids
      const exclusiveDocsA = pullAllBy(sortedDocsA, sortedDocsB, "id");
      const exclusiveDocsB = pullAllBy(sortedDocsB, sortedDocsA, "id");

      const docDifferences: [EnsembleDocument?, EnsembleDocument?][] = compact(
        zip(sortedDocsA, sortedDocsB).map(([a, b]) => {
          if (!areDocumentsEqual(a, b)) {
            return [a, b];
          }
          return null;
        }),
      );

      docDifferences.forEach((diff) => differences.push(diff));
      exclusiveDocsA.forEach((a) => differences.push([a, undefined]));
      exclusiveDocsB.forEach((b) => differences.push([undefined, b]));
    } else if (!isArray(docsA) && !isArray(docsB)) {
      if (!areDocumentsEqual(docsA, docsB)) {
        differences.push([docsA, docsB]);
      }
    }
  });
  return differences;
};

export const areDocumentsEqual = (
  docA?: EnsembleDocument,
  docB?: EnsembleDocument,
): boolean =>
  isEqualWith(
    docA,
    docB,
    (a?: EnsembleDocument, b?: EnsembleDocument) =>
      a?.id === b?.id && a?.content === b?.content,
  );
