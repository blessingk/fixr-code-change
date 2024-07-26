import { Request, Response } from 'express';
import { makeChanges } from '../services/gitService';

export const makeCodeChanges = async (req: Request, res: Response) => {

    const {
        codeChanges,
        commitMessage,
        githubToken,
        owner,
        repo,
        baseBranch,
        featureBranch,
    } = req.body;

    try {
        console.log('here hit')
        const pullRequestUrl = await makeChanges(
            owner,
            repo,
            baseBranch,
            featureBranch,
            codeChanges,
            commitMessage,
            githubToken
        );

        res.json({ message: 'Pull request created successfully', url: pullRequestUrl });
    } catch (error) {
        // @ts-ignore
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: 'An error occurred while processing your request.', message: error });
    }
};
