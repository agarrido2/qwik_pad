import { component$ } from "@builder.io/qwik";

import { companiesLogo } from "~/assets/data/companieslogo";

export const TrustedCompanies = component$(() => {
  const duplicatedLogos = [...companiesLogo, ...companiesLogo]; // Duplica el array para mostrar más logos

  return (
    <div class="mt-28 pb-12 text-center">
      <h3 class="text-lg text-gray-700 font-semibold mb-14">Con la confianza de empresas líderes como</h3>
      <div class="max-w-240 m-0 overflow-hidden relative whitespace-nowrap">
              <div class="inline-flex items-center animate-[marquee_20s_linear_infinite]">
                  {duplicatedLogos.map((company, index) => (
            <img
              key={index}
              class="mt-0 mr-3 w-25 h-25 object-contain opacity-10 transition-opacity duration-300 hover:opacity-100" 
              src={company.logo}
              alt={company.name}
              height={100}
              width={100}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
