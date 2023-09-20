import * as fs from "fs";
import * as path from "path";

function generate_solution_files(working_directory: string): void {
  // Read the contents of the code file
  const code_file_contents = fs.readFileSync(working_directory, "utf8");

  // Generate a new GUID
  const guid = generate_guid();

  // Generate the solution file contents
  const solution_file_contents = `
  Microsoft Visual Studio Solution File, Format Version 12.00
  # Visual Studio 15
  VisualStudioVersion = 15.0.26124.0
  MinimumVisualStudioVersion = 10.0.40219.1
  Project("{${guid}}") = "MyProject", "MyProject.vcxproj", "{${guid}}"
      ProjectSection(ProjectDependencies) = postProject
      EndProjectSection
  EndProject
  Global
      GlobalSection(SolutionConfigurationPlatforms) = preSolution
          Debug|Win32 = Debug|Win32
          Release|Win32 = Release|Win32
          Debug|x64 = Debug|x64
          Release|x64 = Release|x64
      EndGlobalSection
      GlobalSection(ProjectConfigurationPlatforms) = postSolution
          {${guid}}.Debug|Win32.ActiveCfg = Debug|Win32
          {${guid}}.Debug|Win32.Build.0 = Debug|Win32
          {${guid}}.Release|Win32.ActiveCfg = Release|Win32
          {${guid}}.Release|Win32.Build.0 = Release|Win32
          {${guid}}.Debug|x64.ActiveCfg = Debug|x64
          {${guid}}.Debug|x64.Build.0 = Debug|x64
          {${guid}}.Release|x64.ActiveCfg = Release|x64
          {${guid}}.Release|x64.Build.0 = Release|x64
      EndGlobalSection
      GlobalSection(SolutionProperties) = preSolution
          HideSolutionNode = FALSE
      EndGlobalSection
  EndGlobal
  `;

  // Write the solution file to disk
  const solution_file_path = path.join(working_directory, "MyProject.sln");
  fs.writeFileSync(solution_file_path, solution_file_contents);

  console.log(`Solution file generated at ${solution_file_path}`);
}