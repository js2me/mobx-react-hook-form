import { postBuildScript, publishScript } from 'js2me-exports-post-build-script';

postBuildScript({
  buildDir: 'dist',
  rootDir: '.',
  srcDirName: 'src',
  filesToCopy: ['LICENSE', 'README.md'],
  updateVersion: process.env.PUBLISH_VERSION,
  onDone: (versionsDiff, { $ }, packageJson) => {
    if (process.env.PUBLISH) {
      $(`pnpm test`);

      publishScript({
        nextVersion: versionsDiff?.next ?? packageJson.version,
        currVersion: versionsDiff?.current,
        force: process.env.PUBLISH_FORCE === 'true',
        packageManager: 'pnpm',
        tag: process.env.PUBLISH_TAG,
        commitAllCurrentChanges: true,
        createTag: true,
        githubRepoLink: packageJson.homepage,
        cleanupCommand: 'pnpm clean', 
      })
    }
  }
});

