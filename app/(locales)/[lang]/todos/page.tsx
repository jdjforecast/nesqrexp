import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getDictionary } from '@/lib/i18n/dictionaries';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export default async function TodosPage({ params: { lang } }: { params: { lang: string } }) {
  const dict = await getDictionary(lang);
  
  // Create a direct Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: todos, error } = await supabase.from('todos').select('*');

  if (error) {
    console.error('Error fetching todos:', error);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Todos</h1>
        <Button asChild>
          <Link href={`/${lang}/todos/create`}>Create Todo</Link>
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error loading todos: {error.message}
        </div>
      )}
      
      {!todos || todos.length === 0 ? (
        <p className="text-gray-500">No todos found. Create your first todo!</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo: Todo) => (
            <li key={todo.id} className="p-3 bg-white rounded shadow">
              <div className="flex items-center">
                <span className={`${todo.completed ? 'line-through text-gray-400' : ''}`}>
                  {todo.title}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 