import simpleGit from 'simple-git';
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
    const git = simpleGit();
    const octokit = new Octokit({ auth: githubToken });

    console.log('GitService makeChanges');
    //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
    // @ts-ignore
    const repoDir = path.join(process.cwd(), repo);
    try {
        // Clone the repository
        console.log('repoDir', repoDir);
        await git.clone(`https://github.com/${owner}/${repo}.git`, repoDir);
        console.log('cloned', repoDir);
        process.chdir(repoDir);
        console.log('changed', repoDir);

        // Create and switch to a new branch
        await git.checkoutLocalBranch(featureBranch);
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

        return pullRequest.html_url;
    } catch (error) {
        // @ts-ignore
        throw new Error(`Failed to make changes: ${error.message}`);
    } finally {
        process.chdir('..');
        // @ts-ignore
        await removeDir(repoDir);
        //await git.rm('-rf', repoDir);
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


