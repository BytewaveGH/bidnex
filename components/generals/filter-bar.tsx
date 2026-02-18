import React from 'react'
import MultiSelectTemplate from '../templates/multi-select-template'
import PriceSelectTemplate from '../templates/price-select-template'
import SelectTemplate from '../templates/select-template'

export default function FilterBar() {
  return (
 
    <div className="flex justify-between items-center">
       <div className="flex  gap-4">
        <div className="w-[250px]">
            <MultiSelectTemplate
                options={[{label: 'Electronics',   value: 'electronics' }, { label: 'Clothing',  value: 'clothing' }, {label: 'Home / Kitchen', value: 'home-kitchen'},
                    {label: 'Office Products',value: 'office-products'}, {label: 'Phones & Accessories',value: 'phones-accessories'},{label: 'Car Parts',value: 'car-parts'} ]
                }
                onValueChange={() => { }}  defaultValue={[]} placeholder='Category'
            />
            </div>
            <div className="w-[250px]">
              <MultiSelectTemplate
                options={[{label: 'New/Like New',   value: 'new-like-new' }, { label: 'Good Condition',  value: 'good-condition' }, {label: 'AS IS', value: 'as-is'}]
                }
                onValueChange={() => { }} defaultValue={[]} placeholder='Condition'
            />
            </div>
            <div className="w-[250px]">
              <PriceSelectTemplate
                options={[
                    {label: 'Under GHS50', value: 'under-50'},
                    {label: 'GHS50 to GHS100', value: '50-100'},
                    {label: 'GHS100 to GHS300', value: '100-300'},
                    {label: 'GHS300 to GHS500', value: '300-500'},
                    {label: 'GHS500 to GHS1,000', value: '500-1000'},
                    {label: 'GHS1,000 to GHS10,000', value: '1000-10000'}
                ]}
                onValueChange={() => { }} defaultValue={[]} placeholder='Price'
            />
            </div>
         </div>
       <div className="flex flex-col gap-4">
        <SelectTemplate
        options={[{label: 'Ending Soonest', value: 'ending-soonest'},{label: 'Ending Latest', value: 'ending-latest'}, ]}
        placeholder=' Ending soonest'
        />
         </div>
    </div>
    
  )
}