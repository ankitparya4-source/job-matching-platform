"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useCallback } from "react";

function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const applyFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/jobs?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters("search", search);
  };

  return (
    <div className="filters">
      <form onSubmit={handleSearch} className="filter-search">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs by title, company, or keyword…"
          className="filter-input"
        />
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      <div className="filter-row">
        <select
          className="filter-select"
          defaultValue={searchParams.get("locationType") || ""}
          onChange={(e) => applyFilters("locationType", e.target.value)}
        >
          <option value="">All Locations</option>
          <option value="REMOTE">Remote</option>
          <option value="ONSITE">On-site</option>
          <option value="HYBRID">Hybrid</option>
        </select>

        <select
          className="filter-select"
          defaultValue={searchParams.get("experienceLevel") || ""}
          onChange={(e) => applyFilters("experienceLevel", e.target.value)}
        >
          <option value="">All Levels</option>
          <option value="INTERN">Intern</option>
          <option value="JUNIOR">Junior</option>
          <option value="MID">Mid-Level</option>
          <option value="SENIOR">Senior</option>
          <option value="LEAD">Lead</option>
        </select>

        <select
          className="filter-select"
          defaultValue={searchParams.get("minSalary") || ""}
          onChange={(e) => applyFilters("minSalary", e.target.value)}
        >
          <option value="">Any Salary</option>
          <option value="300000">₹3L+</option>
          <option value="500000">₹5L+</option>
          <option value="1000000">₹10L+</option>
          <option value="1500000">₹15L+</option>
          <option value="2500000">₹25L+</option>
          <option value="5000000">₹50L+</option>
        </select>
      </div>
    </div>
  );
}

export function JobFilters() {
  return (
    <Suspense>
      <Filters />
    </Suspense>
  );
}