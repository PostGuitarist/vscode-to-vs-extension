import { CodeFile, FileType, sortCodeFiles } from "./fileTypes";
import { escapeXmlAttribute } from "./xml";

/** MSBuild item element used for each file type. */
const ITEM_ELEMENT: Record<FileType, string> = {
  [FileType.Source]: "ClCompile",
  [FileType.Header]: "ClInclude",
  [FileType.Text]: "Text",
};

/** Solution Explorer filter each file type is placed under. */
const FILTER_NAME: Record<FileType, string> = {
  [FileType.Source]: "Source Files",
  [FileType.Header]: "Header Files",
  [FileType.Text]: "Source Files",
};

const GROUP_ORDER = [FileType.Source, FileType.Header, FileType.Text] as const;

function groupByType(
  files: readonly CodeFile[],
): ReadonlyMap<FileType, CodeFile[]> {
  const groups = new Map<FileType, CodeFile[]>();

  for (const file of sortCodeFiles(files)) {
    const group = groups.get(file.fileType);
    if (group === undefined) {
      groups.set(file.fileType, [file]);
    } else {
      group.push(file);
    }
  }

  return groups;
}

/**
 * Renders one `<ItemGroup>` per file type, using `renderItem` for each entry.
 * Empty groups are omitted entirely: Visual Studio tolerates them, but they
 * add noise to a file users may later edit by hand.
 */
function buildItemGroups(
  files: readonly CodeFile[],
  renderItem: (file: CodeFile) => string,
): string {
  const groups = groupByType(files);
  const rendered: string[] = [];

  for (const fileType of GROUP_ORDER) {
    const group = groups.get(fileType);
    if (group === undefined || group.length === 0) {
      continue;
    }

    const items = group.map(renderItem).join("\n");
    rendered.push(`  <ItemGroup>\n${items}\n  </ItemGroup>`);
  }

  return rendered.join("\n");
}

/** Renders the file `<ItemGroup>`s for a `.vcxproj`. */
export function buildProjectItemGroups(files: readonly CodeFile[]): string {
  return buildItemGroups(files, (file) => {
    const element = ITEM_ELEMENT[file.fileType];
    return `    <${element} Include="${escapeXmlAttribute(file.fileName)}" />`;
  });
}

/** Renders the file `<ItemGroup>`s for a `.vcxproj.filters`. */
export function buildFiltersItemGroups(files: readonly CodeFile[]): string {
  return buildItemGroups(files, (file) => {
    const element = ITEM_ELEMENT[file.fileType];
    const include = escapeXmlAttribute(file.fileName);
    const filter = FILTER_NAME[file.fileType];

    return [
      `    <${element} Include="${include}">`,
      `      <Filter>${filter}</Filter>`,
      `    </${element}>`,
    ].join("\n");
  });
}
