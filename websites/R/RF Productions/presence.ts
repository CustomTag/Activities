// presence.ts (for your RF Music PreMiD Presence GitHub Repository)

// You might need to declare the Presence class and PresenceData type
// if you don't have PreMiD's type definitions installed in this separate project.
// For a real project, look for @premid/types or similar.

declare interface PresenceData {
    clientId?: string; // Optional: Usually set in the Presence constructor
    details?: string;  // Max 128 chars (Song title)
    state?: string;    // Max 128 chars (Artist, album, etc.)
    startTimestamp?: number; // Epoch seconds
    endTimestamp?: number;   // Epoch seconds
    largeImageKey?: string;  // URL or PreMiD asset key
    largeImageText?: string; // Tooltip for large image
    smallImageKey?: string;  // URL or PreMiD asset key
    smallImageText?: string; // Tooltip for small image
    partyId?: string;
    partySize?: number;
    partyMax?: number;
    matchSecret?: string;
    joinSecret?: string;
    spectateSecret?: string;
    instance?: boolean;
    buttons?: Array<{ label: string; url: string }>; // Max 2 buttons
    type?: number; // 0: Playing, 1: Streaming, 2: Listening, 3: Watching
}

declare class Presence {
    constructor(options?: { clientId: string });
    on(event: 'UpdateData', callback: () => Promise<void> | void): void;
    setActivity(data?: PresenceData | null): void; // Can be null to clear
}

const presence = new Presence({
    clientId: '1346614173517221940',
});

// This is called by PreMiD when it's ready or needs an update
presence.on('UpdateData', async () => {
    const rfStatus = (window as any).rfMusicPlayerStatus;
    const presenceData: PresenceData = {};

    if (rfStatus && rfStatus.isPlaying && rfStatus.title && rfStatus.title !== 'Nothing playing') {
        presenceData.details = rfStatus.title.substring(0, 128);
        presenceData.state = rfStatus.artist ? `by ${rfStatus.artist.substring(0, 128)}` : 'On RF Music';
        presenceData.type = 2; 

        if (rfStatus.albumArt) {
            presenceData.largeImageKey = rfStatus.albumArt;
            presenceData.largeImageText = `${rfStatus.title} - ${rfStatus.artist || ''}`;
        } else {
            presenceData.largeImageKey = 'rf_logo_main';
            presenceData.largeImageText = 'RF Music';
        }

        // Example small icon based on play state (you'd upload these to PreMiD)
        presenceData.smallImageKey = 'rf_icon_listening'; // Or 'rf_icon_paused' if you add that logic
        presenceData.smallImageText = 'RF Productions Music';

        // Timestamps
        if (typeof rfStatus.currentTime === 'number' && typeof rfStatus.duration === 'number' && rfStatus.duration > 0) {
            const nowEpochSeconds = Math.floor(Date.now() / 1000);
            presenceData.startTimestamp = nowEpochSeconds - Math.floor(rfStatus.currentTime);
            presenceData.endTimestamp = presenceData.startTimestamp + Math.floor(rfStatus.duration);
        }

        presenceData.buttons = [{ label: "Visit RF Music", url: "https://rfproductionshq.com/radio" }];
       
        presence.setActivity(presenceData);
    } else {
        presenceData.details = 'Browse RF Music';
        presenceData.state = 'Discovering new sounds...';
        presenceData.largeImageKey = 'rf_logo_main'; // Your default presence icon
        presenceData.largeImageText = 'RF Productions Music';
        presenceData.type = 2; // Still "Listening to" but in a generic way
        // No timestamps if not playing
        presence.setActivity(presenceData);
    }
});
