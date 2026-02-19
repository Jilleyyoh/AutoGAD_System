```tsx
// ...existing code...

import { usePage } from '@inertiajs/react';

// ...existing code...

// Inside the component function:

const { url } = usePage();

const active = (path: string) => url.startsWith(path);

// ...existing code...
```