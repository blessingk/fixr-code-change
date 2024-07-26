import simpleGit from 'simple-git';
import { Octokit } from '@octokit/rest';
import { promises as fs } from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
export const makeChanges = async (owner, repo, baseBranch, featureBranch, codeChanges, commitMessage, githubToken) => {
    const git = simpleGit({
        config: [
            `user.name=fixr`,
            `user.email=git@fixr.com`,
        ],
    });
    const octokit = new Octokit({ auth: githubToken });
    const repoDir = path.join(process.env.HOME || '~', process.cwd() + repo);
    console.log('GitService makeChanges');
    try {
        // Clone the repository
        console.log('repoDir', repoDir);
        const repoUrl = `https://${githubToken}:x-oauth-basic@github.com/${owner}/${repo}.git`;
        await git.clone(repoUrl, repoDir);
        //await git.addRemote('origin', repoUrl);
        console.log('cloned', repoDir);
        await git.cwd(repoDir);
        console.log('changed repoDir', repoDir);
        // Create and switch to a new branch
        await createAndSwitchBranch(featureBranch, git);
        console.log('checkoutLocalBranch', featureBranch);
        // Apply the code changes
        for (const change of codeChanges) {
            const filePath = path.join(repoDir, change.filePath);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, change.content, 'utf8');
            const fileContent = await fs.readFile(filePath, 'utf8');
            if (fileContent === change.content) {
                console.log(`Changes applied successfully to ${filePath}`);
            }
            else {
                console.error(`Failed to apply changes to ${filePath}`);
            }
        }
        // Commit and push the changes
        await git.add('.');
        await git.commit(commitMessage);
        await git.push('origin', featureBranch);
        // Create a pull request
        const { data: pullRequest } = await octokit.pulls.create({
            owner,
            repo,
            title: 'Fixr Code Changes',
            head: featureBranch,
            base: baseBranch,
            body: 'This PR contains automated code changes.',
        });
        await removeDir(repoDir);
        return pullRequest.html_url;
    }
    catch (error) {
        // @ts-ignore
        throw new Error(`Failed to make changes: ${error.message}`);
    }
    finally {
        // @ts-ignore
        await removeDir(repoDir);
    }
};
// Function to remove directory using shell command
const removeDir = (dirPath) => {
    return new Promise((resolve, reject) => {
        exec(`rm -rf ${dirPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error removing directory: ${stderr}`);
                reject(error);
            }
            else {
                console.log(`Directory removed: ${stdout}`);
                resolve();
            }
        });
    });
};
const createAndSwitchBranch = async (branchName, git) => {
    try {
        const branches = await git.branch();
        if (branches.all.includes(branchName)) {
            await git.checkout(branchName);
            return;
        }
        await git.checkoutLocalBranch(branchName);
        console.log(`Switched to new branch: ${branchName}`);
    }
    catch (error) {
        await git.checkout(branchName);
        console.error(`Failed to create or switch to branch: ${error}`);
        throw error;
    }
};
