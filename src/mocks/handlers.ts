import { http, HttpResponse, delay } from 'msw';

// --- Mock Data ---
interface MockSubmission {
  title: string;
  abstract: string;
  code: string;
  deleted?: boolean; // Internal flag for mocking deletion
}

interface MockVoteState {
  expanded: boolean;
  vote: 'up' | 'down' | 'neutral';
}

// Simulate server state
let mockSubmissions: Record<string, MockSubmission | null> = {
  SUB001: { title: 'Initial Submission 1', code: "abc123", abstract: 'Abstract 1...' },
  SUB002: { title: 'Another Submission', code: "abc123", abstract: 'Abstract 2...' },
  SUB003: { title: 'Will Be Deleted', code: "bad23", abstract: 'Abstract 3...' },
  SUB004: { title: 'Stable Submission', code: "c55", abstract: 'Abstract 4...' },
};
let currentVersion = 1;

// Simulate server-side vote storage and sequence numbers
const clientVotesStore: Record<string, { lastSequence: number; votes: Record<string, MockVoteState> }> = {};

// Helper to simulate changes over time (for testing polling)
const simulateChanges = () => {
    // Example: Occasionally add/update/delete a submission
    const chance = Math.random();
    let changed = false;
    if (chance < 0.15 && mockSubmissions['SUB005'] === undefined) { // Add new
        console.log('[MSW] Simulating: Adding SUB005');
        mockSubmissions['SUB005'] = { title: 'Newly Added Submission', code: "f22", abstract: 'Comes later...'};
        changed = true;
    } else if (chance < 0.3 && mockSubmissions['SUB001']) { // Update existing
        console.log('[MSW] Simulating: Updating SUB001');
        mockSubmissions['SUB001'] = { ...mockSubmissions['SUB001'], title: `Updated Title v${currentVersion + 1}`};
        changed = true;
    } else if (chance < 0.4 && mockSubmissions['SUB003'] !== null) { // Delete existing
        console.log('[MSW] Simulating: Deleting SUB003');
        mockSubmissions['SUB003'] = null;
        changed = true;
    } else if (chance < 0.45 && mockSubmissions['SUB003'] === null) { // Re-instate deleted
        console.log('[MSW] Simulating: Reinstating SUB003');
        mockSubmissions['SUB003'] = { title: 'Reinstated Submission', code: "bad23", abstract: 'It is back!' };
        changed = true;
    }

    if (changed) {
        currentVersion++;
        console.log(`[MSW] Simulating: Version updated to ${currentVersion}`);
    }
};

// Handlers define the mocked API endpoints
export const handlers = [
  // Handler for getting submissions
  http.get('/api/getsubmissions/:lastVersion?', async ({ params }) => {
    // Simulate potential backend delay
    await delay(Math.random() * 500 + 100); // Delay 100-600ms

    // Simulate some random changes between calls
    simulateChanges();

    const lastVersionParam = params.lastVersion;
    const clientLastVersion = lastVersionParam ? parseInt(lastVersionParam as string, 10) : null;

    console.log(`[MSW] GET /api/getsubmissions - Client Last Version: ${clientLastVersion}, Current Server Version: ${currentVersion}`);

    // Initial request or server version is newer
    if (clientLastVersion === null || clientLastVersion < currentVersion) {
        // In a real scenario, you'd only send diffs, but per spec, send changed/new.
        // For simplicity here, we send the *current state* of all items
        // that were relevant *since* the last version the *server* sent.
        // A better mock might track changes per version.
        // Let's simulate the *protocol* response: send items that *exist* now.
        // A simpler mock just sends the current state if version changed.
        const responseSubmissions: Record<string, { title: string; code: string, abstract: string } | null> = {};
        for (const code in mockSubmissions) {
            // Only include submissions relevant to the *current* version
            // (Simplification: just send the current state of all known codes)
             const sub = mockSubmissions[code];
             if (sub === null) {
                 responseSubmissions[code] = null; // Mark as deleted
             } else if (sub) {
                 responseSubmissions[code] = { title: sub.title, code: sub.code, abstract: sub.abstract };
             }
        }

        // If clientLastVersion === null, send ALL current state.
        // If clientLastVersion < currentVersion, ideally send only *changes*.
        // This mock sends the full current state for simplicity when version differs.
        return HttpResponse.json({
            version: currentVersion,
            submissions: responseSubmissions,
        });

    } else {
      // Client is up-to-date
      console.log('[MSW] No changes since last version.');
      return HttpResponse.json({
        version: currentVersion,
        submissions: {}, // Empty object signifies no changes
      });
    }
  }),

  // GDPR export
  http.post('/api/export', async ({ request }) => {
    await delay(Math.random() * 800 + 1500); // Delay 200-1000ms

    const body = await request.json() as any; // Type assertion for simplicity
    const { events } = body;

    console.log(`[MSW] POST /api/export - events: ${Object.keys(events).join(",")}`);

    return HttpResponse.json(
      { 
        events: Object.fromEntries(
          Object.keys(events).map(
            (x) => [x, "nothing"]
          )
        ) 
      }
    );
  }),

  // --- ADDED Mock Delete Handlers ---
  http.post('/api/delete', async ({ request }) => {
    await delay(Math.random() * 500 + 300); // Simulate delay
    const body = await request.json() as any;
    console.log(`[MSW] MOCK POST /api/delete - Received request for clientId: ${body.clientId}`);
    // Simulate success - in a real backend, you'd delete data associated with this clientId
    return new HttpResponse(null, { status: 204 }); // 204 No Content is typical for successful delete
    // Simulate failure occasionally:
    // if (Math.random() < 0.1) {
    //     console.error('[MSW] Simulating failure for /delete-data/current');
    //     return HttpResponse.json({ message: 'Simulated server error during delete' }, { status: 500 });
    // }
    // return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/delete-all', async ({ request }) => {
      await delay(Math.random() * 800 + 500); // Simulate longer delay
      const body = await request.json() as any;
      const clientIds = Object.values(body.clientIds ?? {});
      console.log(`[MSW] MOCK POST /api/delete-all - Received request for clientIds: ${clientIds.join(', ')}`);
      // Simulate success
      return new HttpResponse(null, { status: 204 });
      // Simulate failure occasionally:
      // if (Math.random() < 0.15) {
      //     console.error('[MSW] Simulating failure for /delete-data/all');
      //     return HttpResponse.json({ message: 'Simulated server error during bulk delete' }, { status: 500 });
      // }
      // return new HttpResponse(null, { status: 204 });
  }),
  // --- End Added Mock Handlers ---


  // Handler for sending votes
  http.post('/api/sendvotes', async ({ request }) => {
    await delay(Math.random() * 800 + 200); // Delay 200-1000ms

    const body = await request.json() as any; // Type assertion for simplicity
    const { clientId, sequenceNumber, votes: clientVotesPayload } = body;

    console.log(`[MSW] POST /api/sendvotes - ClientId: ${clientId}, Seq: ${sequenceNumber}`);

    if (!clientId) {
      return HttpResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    // Simulate server logic for sequence numbers and resend
    const clientData = clientVotesStore[clientId];

    // Simulate a random "resend" request occasionally
    // if (Math.random() < 0.1) { // 10% chance to force resend
    //     console.warn('[MSW] Simulating server forcing a "resend"');
    //     return HttpResponse.json({ status: 'resend' });
    // }

    if (!clientData) {
      // First request from this client (sequenceNumber should be absent)
      // if (sequenceNumber !== undefined && sequenceNumber !== null) {
      //   console.warn(`[MSW] Client ${clientId} sent sequence ${sequenceNumber} on first request. Forcing resend.`);
      //   return HttpResponse.json({ status: 'resend' });
      // } else {
      console.log(`[MSW] First vote batch from ${clientId}. Storing.`);
      clientVotesStore[clientId] = {
        lastSequence: sequenceNumber,
        votes: { ...clientVotesPayload }, // Store the submitted votes
      };
      return HttpResponse.json({ status: 'success', sequenceNumber: 1 });
      // }
    } else {
      // Subsequent request from this client
      const expectedSequence = clientData.lastSequence+1;
      if (sequenceNumber === undefined || sequenceNumber === null) {
          // Client should have sent a sequence number but didn't (e.g., after a resend)
          console.log(`[MSW] Client ${clientId} did not send sequence. This should never happen.`);
           // Client is sending ALL votes after a 'resend' was requested.
          // Replace all known votes for this client.
          clientVotesStore[clientId] = {
              lastSequence: sequenceNumber, // Reset sequence number
              votes: { ...clientVotesPayload },
          };
          return HttpResponse.json({ status: 'success' });

      } else if (sequenceNumber === expectedSequence) {
        // Correct sequence number
        console.log(`[MSW] Client ${clientId} sent correct sequence ${sequenceNumber}. Merging votes.`);
        clientVotesStore[clientId] = {
          lastSequence: sequenceNumber, // Reset sequence number
          votes: { ...clientVotesPayload },
        };
        return HttpResponse.json({ status: 'success' });
      } else {
        // Incorrect sequence number
        console.warn(`[MSW] Client ${clientId} sent sequence ${sequenceNumber}, expected ${expectedSequence}. That is not expected.`);
        clientVotesStore[clientId] = {
          lastSequence: 0, // Reset sequence number
          votes: { ...clientVotesPayload },
        };
        return HttpResponse.json({ status: 'success' });
      }
    }
  }),
];
