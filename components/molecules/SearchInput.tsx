"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export function SearchInput({ onSearch, placeholder = "Enter exam ID", loading }: SearchInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <Button type="submit" disabled={loading || !value.trim()}>
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </form>
  );
}
