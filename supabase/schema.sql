-- Arcade Hub | Ranking global (Supabase PostgreSQL)
-- Ejecutar en Supabase > SQL Editor. No almacena emails ni contraseñas.
-- Cada sesión anónima tiene un récord máximo por juego.
create table if not exists public.arcade_scores (
  user_id uuid not null references auth.users(id) on delete cascade,
  game text not null check (game in ('Culebrita', 'TigreSelva', 'BomberMan', 'TorreArcade')),
  player_name text not null check (
    char_length(btrim(player_name)) between 1 and 12
    and player_name = btrim(player_name)
  ),
  score integer not null check (score >= 0 and score <= 100000000),
  updated_at timestamptz not null default now(),
  primary key (user_id, game)
);

create index if not exists arcade_scores_global_top
  on public.arcade_scores (game, score desc, updated_at asc);

alter table public.arcade_scores enable row level security;

-- Revocar permisos amplios por defecto: nadie puede borrar ni administrar
-- registros de otros jugadores por API.
revoke all on table public.arcade_scores from anon, authenticated;
grant select on table public.arcade_scores to anon;
grant select, insert, update on table public.arcade_scores to authenticated;

drop policy if exists "arcade_global_read" on public.arcade_scores;
create policy "arcade_global_read"
  on public.arcade_scores for select to anon, authenticated using (true);

drop policy if exists "arcade_own_insert" on public.arcade_scores;
create policy "arcade_own_insert"
  on public.arcade_scores for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "arcade_own_update" on public.arcade_scores;
create policy "arcade_own_update"
  on public.arcade_scores for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- No permitimos bajar el récord existente ni cambiar su dueño/juego.
create or replace function public.arcade_keep_highest_score()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id
     or new.game is distinct from old.game then
    raise exception 'No se permite cambiar el jugador o el juego';
  end if;
  if new.score <= old.score then
    new.score := old.score;
    new.player_name := old.player_name;
    new.updated_at := old.updated_at;
  else
    new.updated_at := now();
  end if;
  return new;
end;
$$;

revoke execute on function public.arcade_keep_highest_score() from public, anon, authenticated;

drop trigger if exists trg_arcade_keep_highest_score on public.arcade_scores;
create trigger trg_arcade_keep_highest_score
before update on public.arcade_scores
for each row execute function public.arcade_keep_highest_score();

-- Nota: RLS restringe cambios a la cuenta anónima propietaria,
-- pero una aplicación de navegador no impide puntuaciones falsificadas.
-- Para torneos con premios se necesitaría verificar las partidas en el servidor.
