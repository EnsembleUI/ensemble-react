import {
  assign,
  compact,
  difference,
  get,
  isArray,
  isEqualWith,
  pullAllBy,
  sortBy,
  zip,
} from "lodash-es";
import {
  ArtifactProps,
  EnsembleDocumentType,
  type ApplicationDTO,
  type EnsembleDocument,
} from "./dto";

export const bundleApp = (
  appPartial: Partial<ApplicationDTO>,
  documents: EnsembleDocument[],
): Partial<ApplicationDTO> => {
  return assign(appPartial, {
    screens: documents.filter((d) => d.type === EnsembleDocumentType.Screen),
    widgets: documents.filter((d) => d.type === EnsembleDocumentType.Widget),
    theme: documents.find((d) => d.type === EnsembleDocumentType.Theme),
    env: documents.find((d) => d.type === EnsembleDocumentType.Environment),
    translations: documents.filter((d) => d.type === EnsembleDocumentType.I18n),
    scripts: documents.filter((d) => d.type === EnsembleDocumentType.Script),
  });
};

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
        docsA.filter((doc) => !doc.isArchived),
        "id",
      );
      const sortedDocsB = sortBy(
        docsB.filter((doc) => !doc.isArchived),
        "id",
      );
      // This mutates array so they only contain docs with same ids
      const exclusiveDocsA = pullAllBy([...sortedDocsA], sortedDocsB, "id");
      const exclusiveDocsB = pullAllBy([...sortedDocsB], sortedDocsA, "id");

      const commonDocsA = difference(sortedDocsA, exclusiveDocsA);
      const commonDocsB = difference(sortedDocsB, exclusiveDocsB);

      const docDifferences: [EnsembleDocument?, EnsembleDocument?][] = compact(
        zip(commonDocsA, commonDocsB).map(([a, b]) => {
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
