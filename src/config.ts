interface AppConfig {
  apiBaseUrl: string;
  submissions: {
    pollingIntervalMs: number;
    staleTimeMs: number;
    initialLoadMaxRetries: number;
    pollingMaxRetries: number;
    initialRetryBaseDelayMs: number;
    initialRetryMaxDelayMs: number;
    pollingRetryBaseDelayMs: number;
    pollingRetryMaxDelayMs: number;
  };
  votes: {
    localStorageName: string;
    sendDebounceMs: number;
    initialRetryDelayMs: number;
    maxRetryDelayMs: number;
  };
}

const defaultConfig: AppConfig = {
  apiBaseUrl: '/api', 
  submissions: {
    pollingIntervalMs: 30000,
    staleTimeMs: 29000,
    initialLoadMaxRetries: 5,
    pollingMaxRetries: 1,
    initialRetryBaseDelayMs: 1000,
    initialRetryMaxDelayMs: 10000,
    pollingRetryBaseDelayMs: 1000,
    pollingRetryMaxDelayMs: 30000
  },
  votes: {
    localStorageName: 'default',
    sendDebounceMs: 1000,
    initialRetryDelayMs: 2000,
    maxRetryDelayMs: 30000
  }
};

function safeParseInt(value: string | undefined, defaultValue: number): number {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

let finalConfig: AppConfig = { ...defaultConfig }; 

try {
  const configElement = document.getElementById('app-config-data');

  if (configElement) {
    console.log("Found config element #app-config-data. Reading data attributes.");
    const data = configElement.dataset;

    console.log(data);
    const htmlConfig: AppConfig = {
      apiBaseUrl: data.apiBaseUrl ?? defaultConfig.apiBaseUrl,
      submissions: {
        pollingIntervalMs: safeParseInt(data.submissionsPollingIntervalMs, defaultConfig.submissions.pollingIntervalMs),
        staleTimeMs: safeParseInt(data.submissionsStaleTimeMs, defaultConfig.submissions.staleTimeMs),
        initialLoadMaxRetries: safeParseInt(data.submissionsInitialLoadMaxRetries, defaultConfig.submissions.initialLoadMaxRetries),
        pollingMaxRetries: safeParseInt(data.submissionsPollingMaxRetries, defaultConfig.submissions.pollingMaxRetries),
        initialRetryBaseDelayMs: safeParseInt(data.submissionsInitialRetryBaseDelayMs, defaultConfig.submissions.initialRetryBaseDelayMs),
        initialRetryMaxDelayMs: safeParseInt(data.submissionsInitialRetryMaxDelayMs, defaultConfig.submissions.initialRetryMaxDelayMs),
        pollingRetryBaseDelayMs: safeParseInt(data.submissionsPollingRetryBaseDelayMs, defaultConfig.submissions.pollingRetryBaseDelayMs),
        pollingRetryMaxDelayMs: safeParseInt(data.submissionsPollingRetryMaxDelayMs, defaultConfig.submissions.pollingRetryMaxDelayMs),
      },
      votes: {
        localStorageName: data.votesLocalStorageName ?? defaultConfig.votes.localStorageName,
        sendDebounceMs: safeParseInt(data.votesSendDebounceMs, defaultConfig.votes.sendDebounceMs),
        initialRetryDelayMs: safeParseInt(data.votesInitialRetryDelayMs, defaultConfig.votes.initialRetryDelayMs),
        maxRetryDelayMs: safeParseInt(data.votesMaxRetryDelayMs, defaultConfig.votes.maxRetryDelayMs),
      }
    };
    console.log("AppConfig local storage name:", htmlConfig.votes.localStorageName);

    finalConfig = htmlConfig;
    console.log("App configuration loaded from data attributes:", finalConfig);

  } else {
    console.warn("App configuration element (#app-config-data) not found. Using default config.");
  }
} catch (error) {
  console.error("Error reading app configuration from data attributes. Using default config.", error);
  finalConfig = { ...defaultConfig };
}

export const config = finalConfig;