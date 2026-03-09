import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map, startWith, catchError, of, BehaviorSubject, combineLatest } from 'rxjs';

import { EventService } from '../../core/services/event.service';
import { EventItem } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
@let vm = (vm$ | async) ?? { loading: true, events: [] };

<div class="min-h-screen px-6 py-12 relative overflow-hidden">
  <div class="absolute inset-0 pointer-events-none opacity-5"></div>

  <div class="max-w-7xl mx-auto space-y-10 relative z-10">

    <!-- Header -->
    <div class="relative text-center">
      <h1 class="text-6xl md:text-7xl font-black tracking-tighter uppercase bg-black text-white inline-block px-8 py-4 rotate-[-1deg] shadow-[12px_12px_0px_#f472b6] border-4 border-black">
        ⚡ Events
      </h1>
      <p class="text-sm font-bold text-black bg-[#fde68a] inline-block px-4 py-1 mt-4 border-4 border-black shadow-[6px_6px_0px_#000] rotate-[0.5deg]">
        DISCOVER & JOIN
      </p>
    </div>

    <!-- Search -->
    <div class="flex justify-center">
      <input
        type="text"
        placeholder="🔍 Search events..."
        [(ngModel)]="searchQuery"
        (ngModelChange)="updateFilters()"
        class="w-full max-w-md border-4 border-black px-4 py-2 font-bold bg-white shadow-[4px_4px_0px_#000]"
      />
    </div>

    <!-- Filter Toggle -->
    <div class="flex justify-center">
      <button
        (click)="toggleFilters()"
        class="border-4 border-black bg-[#fde68a] px-5 py-2 font-black shadow-[4px_4px_0px_#000]">
        ⚙ Filters
      </button>
    </div>

    <!-- Filters -->
    @if (showFilters) {

    <div class="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000] rounded-xl mt-4">

      <div class="grid gap-4 md:grid-cols-4">

        <input
          type="date"
          [(ngModel)]="selectedDate"
          (ngModelChange)="updateFilters()"
          class="border-4 border-black px-3 py-2 font-bold"
        />

        <select
          [(ngModel)]="selectedType"
          (ngModelChange)="updateFilters()"
          class="border-4 border-black px-3 py-2 font-bold"
        >
          <option value="">All Events</option>
          <option value="COLLEGE">College</option>
          <option value="GLOBAL">Global</option>
        </select>

        <input
          type="text"
          placeholder="🏫 College"
          [(ngModel)]="selectedCollege"
          (ngModelChange)="updateFilters()"
          class="border-4 border-black px-3 py-2 font-bold"
        />

        <input
          type="text"
          placeholder="🏷 Category"
          [(ngModel)]="selectedCategory"
          (ngModelChange)="updateFilters()"
          class="border-4 border-black px-3 py-2 font-bold"
        />

      </div>

      <div class="mt-4 flex justify-end">
        <button
          (click)="resetFilters()"
          class="border-4 border-black bg-[#f87171] text-white px-4 py-2 font-black shadow-[4px_4px_0px_#000]">
          Reset
        </button>
      </div>

    </div>

    }

    <!-- Loading -->
    @if (vm.loading) {
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        @for (i of skeleton; track $index) {
          <div class="h-56 rounded-3xl border-4 border-black bg-white shadow-[8px_8px_0px_#000] animate-pulse"></div>
        }
      </div>
    }

    <!-- Empty -->
    @if (!vm.loading && vm.events.length === 0) {
      <div class="rounded-[2.5rem] border-4 border-black bg-[#f472b6] p-4 shadow-[16px_16px_0px_#000]">
        <div class="rounded-[2rem] border-4 border-black bg-white p-14 text-center shadow-[8px_8px_0px_#000]">
          <span class="text-7xl block">🎪</span>
          <h3 class="text-2xl font-black">NO EVENTS FOUND</h3>
        </div>
      </div>
    }

    <!-- Events -->
    @if (!vm.loading && vm.events.length > 0) {
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">

        @for (event of vm.events; track event.id) {

          <div class="group rounded-3xl border-4 border-black bg-white p-6 shadow-[10px_10px_0px_#000] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-none flex flex-col hover:bg-[#fff4f2]">

            <div class="mb-4 flex items-center justify-between">

              <span
                class="flex items-center gap-1 rounded-xl border-4 border-black px-3 py-1 text-xs font-black shadow-[4px_4px_0px_#000]"
                [class.bg-[#fde68a]]="event.scope === 'COLLEGE'"
                [class.bg-[#bbf7d0]]="event.scope === 'GLOBAL'"
              >
                {{ event.scope === 'GLOBAL' ? '🌍' : '🏛️' }}
                {{ event.scope }}
              </span>

              <span class="text-xs font-black text-neutral-600 flex items-center gap-1">
                <span class="text-lg">🏷️</span> {{ event.category }}
              </span>

            </div>

            <h3 class="text-xl font-black leading-tight mb-2">
              {{ event.title }}
            </h3>

            <p class="text-sm font-medium text-neutral-700 line-clamp-2 mb-4 flex-grow">
              {{ event.description }}
            </p>

            <div class="mt-auto flex items-center justify-between border-t-4 border-black pt-4 text-xs font-black">
              <div class="flex items-center gap-1 truncate max-w-full">
                <span class="text-lg">🏫</span>
                <span class="truncate">{{ event.college?.name || 'Unknown' }}</span>
              </div>
            </div>

            <div class="mt-2 flex items-center justify-between text-xs font-black">
              <div class="flex items-center gap-1 rounded-lg border-4 border-black bg-[#e0f2fe] px-2 py-1 shadow-[3px_3px_0px_#000]">
                <span class="text-base">📅</span>
                {{ event.startDate | date:'mediumDate' }}
              </div>
            </div>

            <!-- Register Button -->
            <button
              (click)="openRegister(event)"
              class="mt-4 border-4 border-black bg-[#bbf7d0] px-3 py-2 font-black shadow-[4px_4px_0px_#000]">
              Register
            </button>

          </div>

        }

      </div>
    }

  </div>
</div>

<!-- Registration Modal -->
@if (showRegisterModal) {

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

  <div class="bg-white border-4 border-black p-8 w-[400px] shadow-[10px_10px_0px_#000] space-y-4">

    <h2 class="text-2xl font-black">Register Event</h2>

    <p class="text-sm font-bold">
      {{ selectedEvent?.title }}
    </p>

    <input
      type="text"
      placeholder="Full Name"
      [(ngModel)]="registration.name"
      class="w-full border-4 border-black px-3 py-2 font-bold"
    />

    <input
      type="email"
      placeholder="Email"
      [(ngModel)]="registration.email"
      class="w-full border-4 border-black px-3 py-2 font-bold"
    />

    <input
      type="text"
      placeholder="College"
      [(ngModel)]="registration.college"
      class="w-full border-4 border-black px-3 py-2 font-bold"
    />

    <div class="flex justify-between">

      <button
        (click)="submitRegistration()"
        class="border-4 border-black bg-[#bbf7d0] px-4 py-2 font-black shadow-[4px_4px_0px_#000]">
        Submit
      </button>

      <button
        (click)="closeRegister()"
        class="border-4 border-black bg-[#f87171] px-4 py-2 font-black shadow-[4px_4px_0px_#000]">
        Cancel
      </button>

    </div>

  </div>

</div>

}
`,
})
export class EventListComponent {

  private eventService = inject(EventService);

  skeleton = Array(6);

  selectedDate = '';
  selectedType = '';
  selectedCollege = '';
  selectedCategory = '';
  searchQuery = '';

  showFilters = false;

  showRegisterModal = false;
  selectedEvent: EventItem | null = null;

  registration = {
    name: '',
    email: '',
    college: ''
  };

  private filters$ = new BehaviorSubject(null);

  updateFilters() {
    this.filters$.next(null);
  }

  resetFilters() {
    this.selectedDate = '';
    this.selectedType = '';
    this.selectedCollege = '';
    this.selectedCategory = '';
    this.searchQuery = '';
    this.filters$.next(null);
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  openRegister(event: EventItem) {
    this.selectedEvent = event;
    this.showRegisterModal = true;
  }

  closeRegister() {
    this.showRegisterModal = false;
  }

  submitRegistration() {
    console.log({
      eventId: this.selectedEvent?.id,
      ...this.registration
    });

    this.closeRegister();
  }

  vm$ = combineLatest([
    this.eventService.getEvents(),
    this.filters$
  ]).pipe(
    map(([res]) => {

      let events = res.events as EventItem[];

      events = events.filter(event => {

        const matchDate =
          !this.selectedDate ||
          new Date(event.startDate).toDateString() ===
          new Date(this.selectedDate).toDateString();

        const matchType =
          !this.selectedType || event.scope === this.selectedType;

        const matchCollege =
          !this.selectedCollege ||
          event.college?.name?.toLowerCase().includes(this.selectedCollege.toLowerCase());

        const matchCategory =
          !this.selectedCategory ||
          event.category?.toLowerCase().includes(this.selectedCategory.toLowerCase());

        const matchSearch =
          !this.searchQuery ||
          event.title?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          event.category?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          event.college?.name?.toLowerCase().includes(this.searchQuery.toLowerCase());

        return matchDate && matchType && matchCollege && matchCategory && matchSearch;

      });

      return {
        loading: false,
        events
      };

    }),
    startWith({
      loading: true,
      events: [] as EventItem[]
    }),
    catchError(() =>
      of({
        loading: false,
        events: [] as EventItem[]
      })
    )
  );
}