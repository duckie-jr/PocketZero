// Http — lightweight fetch wrapper with JSON handling and timeouts
// Usage:
//   const data = await Http.get('https://api.open-meteo.com/v1/forecast?...')
//   const result = await Http.post('https://example.com/api', { body: payload })
//   Http.get(url, { timeout: 5000, headers: { 'X-Key': 'value' } })

const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Core request helper.
 * @param {string} url
 * @param {RequestInit & { timeout?: number }} [options]
 * @returns {Promise<{ data: any, status: number, ok: boolean }>}
 */
async function request(url, options = {}) {
    const { timeout = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    let response;
    try {
        response = await fetch(url, {
            ...fetchOptions,
            signal: abortController.signal,
        });
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`Http: request timed out after ${timeout}ms — ${url}`);
        }
        throw new Error(`Http: network error — ${error.message}`);
    } finally {
        clearTimeout(timeoutId);
    }

    const contentType = response.headers.get('content-type') ?? '';
    let data;

    if (contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        const errorMessage = typeof data === 'object' ? JSON.stringify(data) : data;
        throw new Error(`Http: ${response.status} ${response.statusText} — ${errorMessage}`);
    }

    return { data, status: response.status, ok: true };
}

export const Http = {
    /**
     * GET request — returns parsed data directly.
     * @param {string} url
     * @param {object} [options]
     * @returns {Promise<any>}
     */
    async get(url, options = {}) {
        const { data } = await request(url, { method: 'GET', ...options });
        return data;
    },

    /**
     * POST request with JSON body — returns parsed data.
     * @param {string} url
     * @param {object} body
     * @param {object} [options]
     * @returns {Promise<any>}
     */
    async post(url, body, options = {}) {
        const { data } = await request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...options.headers },
            body: JSON.stringify(body),
            ...options,
        });
        return data;
    },

    /**
     * PUT request with JSON body.
     * @param {string} url
     * @param {object} body
     * @param {object} [options]
     * @returns {Promise<any>}
     */
    async put(url, body, options = {}) {
        const { data } = await request(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...options.headers },
            body: JSON.stringify(body),
            ...options,
        });
        return data;
    },

    /**
     * DELETE request.
     * @param {string} url
     * @param {object} [options]
     * @returns {Promise<any>}
     */
    async delete(url, options = {}) {
        const { data } = await request(url, { method: 'DELETE', ...options });
        return data;
    },

    /**
     * Full request for advanced usage — returns { data, status, ok }.
     * @param {string} url
     * @param {object} [options]
     */
    request,
};
