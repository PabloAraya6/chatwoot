export const CLASES_ASESOR = [
  'max-md:[&_.right-bubble.bg-n-solid-blue]:!bg-n-slate-3',
  'max-sm:[&_header:has(#toggleContactsFilterButton)>div]:flex-col max-sm:[&_header:has(#toggleContactsFilterButton)>div>div]:w-full',
  'max-md:[&_button:not([role=switch])]:min-h-11 max-md:[&_button:not([role=switch])]:min-w-11 max-md:[&_input:not([type=checkbox])]:min-h-11 max-md:[&_select]:min-h-11 max-md:[&_li>a]:min-h-11 max-md:pt-[env(safe-area-inset-top)] max-md:ps-[env(safe-area-inset-left)] max-md:pe-[env(safe-area-inset-right)]',
  'max-md:[&_.conversation-details-wrap>div:has(>.header-actions-wrap)]:h-auto max-md:[&_.conversation-details-wrap>div:has(>.header-actions-wrap)]:flex-none max-md:[&_.reply-box>div:has(>.left-wrap)]:flex-wrap max-md:[&_.reply-box>div:has(>.left-wrap)]:gap-2 max-md:[&_.reply-box_.right-wrap]:ms-auto',
  '[&_.fixed:has([data-contact-sidebar-toggle])]:pointer-events-none [&_[data-contact-sidebar-toggle]]:pointer-events-auto [&_#contact-sidebar-content]:pointer-events-auto',
  'max-md:[&_.reply-box>div:has(>.left-wrap)]:p-2 max-md:[&_.reply-box_.left-wrap]:gap-1 max-md:[&_.reply-box_.left-wrap]:flex-wrap max-md:[&_.reply-box_.ProseMirror]:text-base max-md:[&_.reply-box]:mb-[max(0.5rem,env(safe-area-inset-bottom))]',
];

export const COMPOSER_MOBILE =
  'grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-end !p-1 !rounded-2xl [&_.ProseMirror]:!py-2.5 [&_.ProseMirror]:!text-base [&_.ProseMirror]:leading-6 [&_.ProseMirror>p]:!my-0 [&_.ProseMirror>p]:!leading-6';
