import { SortDirection } from '../drivers/Search';

type SearchCriteriaArray = {
  type: 'array';
  originalValue: string;
  parts: string[];
}

type SearchCriteriaSimple = {
  type: 'simple';
  originalValue: string;
  value: string;
}

export type SearchCriteria = SearchCriteriaArray | SearchCriteriaSimple;

export type SortToken = {
  key: string;
  order: SortDirection;
}

export type NamedToken = {
  key: string;
  criteria: SearchCriteria;
  reverse: boolean;
}

export type GeneralToken = {
  criteria: SearchCriteria;
  reverse: boolean;
}

export type SearchQuery = {
  sortTokens: SortToken[];
  namedTokens: NamedToken[];
  generalTokens: GeneralToken[];
}

export function buildCriteria(originalValue: string, value: string): SearchCriteria {
  const parts = value.split(';');
  if (parts.length > 1) {
    // Array of values
    return {
      type: 'array',
      originalValue,
      parts: parts.map(p => p.trim())
    }
  } else {
    // Simple search
    return {
      type: 'simple',
      originalValue,
      value
    }
  }
}

function parseNamedToken(key: string, value: string, reverse: boolean): NamedToken {
  return {
    criteria: buildCriteria(value, value),
    key,
    reverse
  }
}

function parseSortToken(value: string, reverse: boolean): SortToken {
  let order: SortDirection = reverse ? SortDirection.DESC : SortDirection.ASC;
  return {
    key: value,
    order: order
  }
}

function parseGeneralToken(value: string, reverse: boolean): GeneralToken {
  return {
    criteria: buildCriteria(value, value),
    reverse
  }
}

export function parse(queryText: string): SearchQuery {
  const query: SearchQuery = {
    sortTokens: [],
    namedTokens: [],
    generalTokens: []
  };

  const parts = queryText.toLowerCase().split(' ');
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];
    if (!part) {
      continue;
    }

    // Check for reversal
    let reverse = false;
    if (part.startsWith('-')) {
      part = part.slice(1);
      reverse = true;
    }

    // Match for semi-colon seperation
    const match = part.match(/^(.*?)(?<!\\):(.*)$/)
    if (match) {
      const key = match[1];
      const value = match[2];

      switch (key) {
        case 'sort': {
          query.sortTokens.push(parseSortToken(value, reverse))
          break;
        }
        default: {
          query.namedTokens.push(parseNamedToken(key, value, reverse))
        }
      }
    } else {
      query.generalTokens.push(parseGeneralToken(part, reverse))
    }
  }

  return query;
}