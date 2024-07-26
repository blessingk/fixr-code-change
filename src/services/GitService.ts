import simpleGit from 'simple-git';
import { Octokit } from '@octokit/rest';
import { promises as fs } from 'fs';
import * as path from 'path';

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

    // @ts-ignore
    // @ts-ignore
    try {
        // Clone the repository
        await git.clone(`https://github.com/${owner}/${repo}.git`);
        process.chdir(repo);

        // Create and switch to a new branch
        await git.checkoutLocalBranch(featureBranch);

        // Apply the code changes
        for (const change of codeChanges) {
            const filePath = path.join(process.cwd(), change.filePath);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, change.content, 'utf8');
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

        return pullRequest.html_url;
    } catch (error) {
        // @ts-ignore
        throw new Error(`Failed to make changes: ${error.message}`);
    } finally {
        process.chdir('..');
        // @ts-ignore
        await git.rm('-rf', repo);
    }
};
