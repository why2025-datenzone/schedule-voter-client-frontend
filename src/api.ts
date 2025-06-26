import { config } from './config'; 


export interface DeletePayload {
  clientId: string;
}

export interface DeleteAllPayload {
  clientIds: Record<string, string>;
}

export interface SubmissionPayload {
    title: string;
    code: string;
    abstract: string;
  }

  export interface SubmissionsApiResponse {
    version: number;
    submissions: Record<string, SubmissionPayload | null>;
  }

  export interface VotePayload {
    expanded: boolean;
    vote: 'up' | 'down' | 'neutral';
  }

  export interface SendVotesPayload {
    clientId: string;
    sequenceNumber?: number | null;
    votes: Record<string, VotePayload>;
  }

  export interface ExportPayload {
    events: Record<string, string>;
  }

  export interface SendVotesSuccessResponse {
    status: 'success';
  }

  export type SendVotesResponse = SendVotesSuccessResponse;

  const BASE_URL = config.apiBaseUrl; 

  export async function deleteCurrentEventData(payload: DeletePayload): Promise<void> {
    console.log('Requesting deletion of current event data for clientId:', payload.clientId);
    const response = await fetch(`${BASE_URL}/delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to delete current event data:', response.status, response.statusText, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText || response.statusText}`);
    }
    console.log('Successfully requested deletion of current event data.');
  }


  export async function deleteAllEventData(payload: DeleteAllPayload): Promise<void> {
    console.log('Requesting deletion of all event data for clientIds:', Object.values(payload.clientIds).join(', '));
    const response = await fetch(`${BASE_URL}/delete-all`, { 
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to delete all event data:', response.status, response.statusText, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText || response.statusText}`);
    }
    console.log('Successfully requested deletion of all event data.');
  }

  export async function fetchSubmissions(lastVersion: number | null): Promise<SubmissionsApiResponse> {
      const url = lastVersion === null
          ? `${BASE_URL}/getsubmissions`
          : `${BASE_URL}/getsubmissions/${lastVersion}`;

      console.log('Fetching submissions from:', url); 
      const response = await fetch(url);

      if (!response.ok) {
          console.error('Failed to fetch submissions:', response.status, response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: SubmissionsApiResponse = await response.json();
      console.log('Received submissions response:', data); 
      return data;
  }


  export async function gdprExport(payload: ExportPayload): Promise<string> {
    console.log('Sarting export');
    const response = await fetch(`${BASE_URL}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
          
    if (!response.ok) {
        console.error('Failed to submit votes:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return JSON.stringify(data, null, 2);
  }

  export async function submitVotes(payload: SendVotesPayload): Promise<SendVotesResponse> {
      console.log('Submitting votes:', payload); // Debug log
      const response = await fetch(`${BASE_URL}/sendvotes`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
      });

      if (!response.ok) {
          console.error('Failed to submit votes:', response.status, response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SendVotesResponse = await response.json();
      console.log('Received vote submission response:', data); 
      return data;
  }