import { match } from "path-to-regexp";

// Utility to convert glob to path-to-regexp pattern
function globToRegexpPattern(glob: string): string {
    // Replace ** with :param(.*) and * with :param([^/]+)
    return glob
        .replace(/\*\*/g, `:param(.*)`)
        .replace(/\*/g, `:param([^/]+)`);
}

function extractMatches(pattern: string, url: string): Array<string> | null {
    const regexpPattern = globToRegexpPattern(pattern);
    const matcher = match(regexpPattern, {
        decode: decodeURIComponent,
    });
    const result = matcher(url);
    if (!result) {
        return null;
    }

    // Flatten all param values into a single array
    return Object.values(result.params).flat();
}

