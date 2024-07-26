import simpleGit, {SimpleGit} from 'simple-git';
import { Octokit } from '@octokit/rest';
import { promises as fs } from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

export const makeChanges = async (
    owner: string,
    repo: string,
    baseBranch: string,
    featureBranch: string,
    codeChanges: { filePath: string; content: string }[],
    commitMessage: string,
    githubToken: string
) => {

    const git = simpleGit({
        config: [
            `Authorization: token ${githubToken}`
        ]
    });
    const octokit = new Octokit({ auth: githubToken });
    //todo - give directory
    const repoDir = path.join(process.env.HOME || '~', 'Sites/'+repo);
    console.log('GitService makeChanges');
    try {
        // Clone the repository
        console.log('repoDir', repoDir);
        //const repoUrl = `git@github.com/${owner}/${repo}.git`;
        const repoUrl = `https://github.com/${owner}/${repo}.git`;
        await git.clone(repoUrl, repoDir);
        console.log('cloned', repoDir);
        await git.cwd(repoDir);
        console.log('changed repoDir', repoDir);

        //await git.addRemote('origin', `git@github.com:${owner}/${repo}.git`)
        //console.log('changed repoDir', repoDir);

        const status = await git.status();
        console.log('status', status)
        // Create and switch to a new branch
        await createAndSwitchBranch(featureBranch, git)
        console.log('checkoutLocalBranch', featureBranch);

        // Apply the code changes
        for (const change of codeChanges) {
            const filePath = path.join(process.cwd()+'../', change.filePath);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, change.content, 'utf8');
        }

        console.log('changes applied', codeChanges);

        // Commit and push the changes
        await git.add('.');
        const com = await git.commit(commitMessage);
        console.log('commit message', com)
        await git.push(repoUrl, featureBranch);

        // Create a pull request
        const { data: pullRequest } = await octokit.pulls.create({
            owner,
            repo,
            title: 'Fixr Code Changes',
            head: featureBranch,
            base: baseBranch,
            body: 'This PR contains automated code changes.',
        });

        return pullRequest.html_url;
    } catch (error) {
        // @ts-ignore
        throw new Error(`Failed to make changes: ${error.message}`);
    } finally {
        //process.chdir('..');
        // @ts-ignore
        await removeDir(repoDir);
        // await git.rm('-rf', repoDir);
    }
};

// Function to remove directory using shell command
const removeDir = (dirPath: string) => {
    return new Promise<void>((resolve, reject) => {
        exec(`rm -rf ${dirPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error removing directory: ${stderr}`);
                reject(error);
            } else {
                console.log(`Directory removed: ${stdout}`);
                resolve();
            }
        });
    });
};

const createAndSwitchBranch = async (branchName: string, git: SimpleGit) => {
    try {
        const branches = await git.branch();
        if (branches.all.includes(branchName)) {
            await git.checkout(branchName)
            return;
        }
        await git.checkoutLocalBranch(branchName);
        console.log(`Switched to new branch: ${branchName}`);
    } catch (error) {
        await git.checkout(branchName)
        console.error(`Failed to create or switch to branch: ${error}`);
        throw error;
    }
}



