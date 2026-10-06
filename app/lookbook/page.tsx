import { redirect } from 'next/navigation';

/** /lookbook → the first lookbook. */
export default function LookbookIndex() {
  redirect('/lookbook/1');
}
