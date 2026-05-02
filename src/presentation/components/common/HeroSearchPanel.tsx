import {
  CalendarDays,
  Plane,
  Search,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, toIsoDate } from '../../../shared/utils/dates';
import { useAppStore } from '../../hooks/useAppStore';

interface HeroSearchPanelProps {
  compact?: boolean;
}

interface HeroSearchDraft {
  destinationId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: string;
}

type HeroSearchDraftAction =
  | { type: 'sync'; draft: HeroSearchDraft }
  | { type: 'setDestinationId'; value: string }
  | { type: 'setCheckInDate'; value: string }
  | { type: 'setCheckOutDate'; value: string }
  | { type: 'setGuests'; value: string };

const getMinimumCheckOutDate = (checkInDate: string): string =>
  checkInDate ? toIsoDate(addDays(checkInDate, 2)) : '';

const normalizeCheckOutDate = (
  checkInDate: string,
  checkOutDate: string,
): string => {
  const minimumCheckOutDate = getMinimumCheckOutDate(checkInDate);

  if (
    checkInDate &&
    checkOutDate &&
    minimumCheckOutDate &&
    checkOutDate < minimumCheckOutDate
  ) {
    return minimumCheckOutDate;
  }

  return checkOutDate;
};

const normalizeGuestsInput = (value: string): string => {
  if (value.trim() === '') {
    return '';
  }

  const normalized = Math.max(1, Math.min(12, Number(value)));
  return Number.isNaN(normalized) ? '' : String(normalized);
};

const reduceHeroSearchDraft = (
  state: HeroSearchDraft,
  action: HeroSearchDraftAction,
): HeroSearchDraft => {
  switch (action.type) {
    case 'sync':
      return action.draft;
    case 'setDestinationId':
      return {
        ...state,
        destinationId: action.value,
      };
    case 'setCheckInDate':
      return {
        ...state,
        checkInDate: action.value,
        checkOutDate: normalizeCheckOutDate(action.value, state.checkOutDate),
      };
    case 'setCheckOutDate':
      return {
        ...state,
        checkOutDate: action.value,
      };
    case 'setGuests':
      return {
        ...state,
        guests: normalizeGuestsInput(action.value),
      };
    default:
      return state;
  }
};

export const HeroSearchPanel = ({ compact = false }: HeroSearchPanelProps) => {
  const { store, state } = useAppStore();
  const navigate = useNavigate();
  const meta = store.getCatalogMeta();
  const filter = state.filter;
  const syncedDraft = useMemo<HeroSearchDraft>(() => {
    const checkInDate = filter.getCheckInDate();

    return {
      destinationId: filter.getDestinations()[0] ?? '',
      checkInDate,
      checkOutDate: normalizeCheckOutDate(checkInDate, filter.getCheckOutDate()),
      guests: filter.getGuests() > 0 ? String(filter.getGuests()) : '',
    };
  }, [filter]);
  const [draft, dispatch] = useReducer(reduceHeroSearchDraft, syncedDraft);
  const minimumCheckOutDate = getMinimumCheckOutDate(draft.checkInDate);

  useEffect(() => {
    dispatch({
      type: 'sync',
      draft: syncedDraft,
    });
  }, [syncedDraft]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedGuests =
      draft.guests.trim() === '' ? 0 : Math.max(1, Math.min(12, Number(draft.guests)));
    const normalizedCheckOutDate = normalizeCheckOutDate(
      draft.checkInDate,
      draft.checkOutDate,
    );

    store.updateFilter(
      {
        destinations: draft.destinationId ? [draft.destinationId] : [],
        checkInDate: draft.checkInDate,
        checkOutDate: normalizedCheckOutDate,
        guests: Number.isNaN(normalizedGuests) ? 0 : normalizedGuests,
        query: '',
      },
      true,
    );

    navigate('/tours');
  };

  return (
    <form
      className={`hero-search ${compact ? 'hero-search--compact' : ''}`}
      onSubmit={handleSubmit}
    >
      <div className="hero-search__fields">
        <label>
          Destinations:
          <span className="hero-search__field">
            <Plane size={16} />
            <select
              value={draft.destinationId}
              onChange={(event) =>
                dispatch({
                  type: 'setDestinationId',
                  value: event.target.value,
                })
              }
            >
              <option value="">Where are you going...</option>
              {meta.destinations.map((destination) => (
                <option key={destination.id} value={destination.id}>
                  {destination.label}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label>
          Check In:
          <span className="hero-search__field">
            <CalendarDays size={16} />
            <input
              type="date"
              value={draft.checkInDate}
              onChange={(event) =>
                dispatch({
                  type: 'setCheckInDate',
                  value: event.target.value,
                })
              }
            />
          </span>
        </label>

        <label>
          Check Out:
          <span className="hero-search__field">
            <CalendarDays size={16} />
            <input
              type="date"
              value={draft.checkOutDate}
              min={draft.checkInDate ? minimumCheckOutDate : undefined}
              onChange={(event) =>
                dispatch({
                  type: 'setCheckOutDate',
                  value: event.target.value,
                })
              }
            />
          </span>
        </label>

        <label>
          Guest:
          <span className="hero-search__field">
            <Users size={16} />
            <input
              type="number"
              min={1}
              max={12}
              value={draft.guests}
              onChange={(event) =>
                dispatch({
                  type: 'setGuests',
                  value: event.target.value,
                })
              }
            />
          </span>
        </label>

        <button className="button button--search" type="submit">
          Search
          <Search size={16} />
        </button>
      </div>
    </form>
  );
};
