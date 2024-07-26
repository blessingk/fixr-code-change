import simpleGit, { SimpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const git: SimpleGit = simpleGit();

export class BranchService {
    private git: SimpleGit;
    private repoDir: string;

    constructor(repoDir: string) {
        this.repoDir = repoDir;
        this.git = simpleGit(repoDir);
    }

    // Check if a branch exists
    async branchExists(branchName: string): Promise<boolean> {
        const branches = await this.git.branch();
        return branches.all.includes(branchName);
    }

    // Delete a local branch
    async deleteLocalBranch(branchName: string): Promise<void> {
        try {
            await this.git.branch(['-D', branchName]);
            console.log(`Deleted local branch: ${branchName}`);
        } catch (error) {// @ts-ignore
            console.error(`Failed to delete local branch: ${error.message}`);
        }
    }

    // Delete a remote branch
    async deleteRemoteBranch(branchName: string): Promise<void> {
        try {
            await this.git.push(['origin', '--delete', branchName]);
            console.log(`Deleted remote branch: ${branchName}`);
        } catch (error) {// @ts-ignore
            console.error(`Failed to delete remote branch: ${error.message}`);
        }
    }

    // Create and switch to a new branch
    async createAndSwitchBranch(branchName: string): Promise<void> {
        try {
            await this.git.checkoutLocalBranch(branchName);
            console.log(`Switched to new branch: ${branchName}`);
        } catch (error) {// @ts-ignore
            console.error(`Failed to create or switch to branch: ${error.message}`);
        }
    }

    // Remove sensitive information using git filter-repo
    async removeSensitiveInformation(tokens: string[]): Promise<void> {
        const replaceTextFile = path.join(this.repoDir, 'replace-text.txt');
        const replaceTextContent = tokens.map(token => `${token}==>REDACTED`).join('\n');
        fs.writeFileSync(replaceTextFile, replaceTextContent, 'utf8');

        try {
            await execPromise(`git filter-repo --replace-text ${replaceTextFile}`, { cwd: this.repoDir });
            console.log('Sensitive information removed successfully.');
        } catch (error) {// @ts-ignore
            console.error(`Failed to remove sensitive information: ${error.message}`);
        } finally {
            fs.unlinkSync(replaceTextFile); // Clean up the temporary file
        }
    }
}