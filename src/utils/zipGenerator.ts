import JSZip from 'jszip';
import { JAVA_PROJECT_FILES } from '../data/javaProjectFiles';

export async function downloadProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Add all project files to zip
  for (const file of JAVA_PROJECT_FILES) {
    zip.file(file.path, file.code);
  }

  // Add .gitignore
  const gitignoreContent = `# Compiled class file
*.class

# Log file
*.log
logs/

# BlueJ files
*.ctxt

# Mobile Tools for Java (J2ME)
.mtj.tmp/

# Package Files #
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# virtual machine crash logs
hs_err_pid*
replay_pid*

# Maven target
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar

# IDE specific files
.idea/
*.iml
.vscode/
.settings/
.project
.classpath

# Invoices output directory
invoices/*.txt
!invoices/.gitkeep
`;

  zip.file('.gitignore', gitignoreContent);
  zip.file('invoices/.gitkeep', '# Keeps invoices directory in git\n');
  zip.file('logs/.gitkeep', '# Keeps logs directory in git\n');

  // Add LICENSE (Apache 2.0)
  const licenseContent = `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION
Copyright 2026 Abhinav Jain (abhinavjain45678@gmail.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
`;
  zip.file('LICENSE', licenseContent);

  // Generate blob and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'hotel-food-management-system-java.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
