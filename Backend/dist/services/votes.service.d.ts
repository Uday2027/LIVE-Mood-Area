export declare const recalculateCredibility: (pinId: string) => Promise<number>;
type CastVoteParams = {
    pinId: string;
    sessionId: string;
    vote: 'CONFIRM' | 'DISPUTE';
};
export declare const castVote: (params: CastVoteParams) => Promise<{
    credibilityScore: number;
    removed: boolean;
}>;
export {};
//# sourceMappingURL=votes.service.d.ts.map