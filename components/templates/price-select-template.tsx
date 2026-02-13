'use client'
import { MultiSelect } from "@/components/ui/multi-select";
import { useState } from "react";
import { PriceFilter } from "../ui/price-filter";


    export default function PriceSelectTemplate(
        { options, onValueChange, defaultValue, placeholder }: { options: { label: string, value: string }[], onValueChange: (value: string[]) => void, defaultValue: string[], placeholder: string }
) {
	const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue || []);

	const handleValueChange = (value: string[]) => {
		setSelectedValues(value);
		onValueChange(value);
	};

	return (
		<PriceFilter
        placeholder={placeholder}
			options={options}
			onValueChange={handleValueChange}
			defaultValue={selectedValues}
		/>
	);
}