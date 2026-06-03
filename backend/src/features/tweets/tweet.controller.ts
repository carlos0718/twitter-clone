import type {Response} from 'express';
import type {AuthRequest} from '../../shared/types';
import {createTweetSchema} from './tweet.types';
import * as tweetService from './tweet.service';

export async function createTweetHandler(req: AuthRequest, res: Response) {
	const parsed = createTweetSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({error: 'Validation failed', details: parsed.error.flatten()});
		return;
	}
	try {
		const tweet = await tweetService.createTweet(req.userId, parsed.data);
		res.status(201).json({tweet});
	} catch (err) {
		const e = err as Error & {statusCode?: number};
		res.status(e.statusCode ?? 500).json({error: e.message});
	}
}

export async function deleteTweetHandler(req: AuthRequest, res: Response) {
	try {
		await tweetService.deleteTweet(req.userId, req.params.id as string);
		res.status(204).send();
	} catch (err) {
		const e = err as Error & {statusCode?: number};
		res.status(e.statusCode ?? 500).json({error: e.message});
	}
}

export async function getTweetHandler(req: AuthRequest, res: Response) {
	try {
		const tweet = await tweetService.getTweetById(req.params.id as string, req.userId);
		res.json({tweet});
	} catch (err) {
		const e = err as Error & {statusCode?: number};
		res.status(e.statusCode ?? 500).json({error: e.message});
	}
}
