import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const labels = { diagnostic: 'Diagnostic', resource: 'Learning', practice: 'Practice', assessment: 'Quiz', mock: 'Mock trial', competition: 'Competition', camp: 'Opportunity' };
const button = 'inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-900 px-4 py-2 font-medium text-white disabled:opacity-50';

export default function GiftedExperience() {
  const [items, setItems] = useState([]), [selectedId, setSelectedId] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function rpc(name, args) { const { data, error: rpcError } = await supabase.rpc(name, args).abortSignal(AbortSignal.timeout(20000)); if (rpcError) throw rpcError; return data; }
  async function load() {
    setBusy(true); setError('');
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error('Sign in to continue your Gifted Experience.');
      const journeys = await rpc('my_gifted_experiences'); setItems(journeys || []); setSelectedId(current => current || journeys?.[0]?.assignmentId || null);
    } catch (loadError) { setError(loadError.message || 'Could not load your Gifted Experience.'); } finally { setBusy(false); }
  }
  useEffect(() => { load(); }, []);
  const current = useMemo(() => items.find(item => item.assignmentId === selectedId) || items[0], [items, selectedId]);
  const steps = current?.steps || current?.snapshot?.steps || [];
  const completedCount = steps.filter(step => current?.completed?.[step.id]).length;
  async function complete(stepId) {
    setBusy(true); setError('');
    try {
      const next = await rpc('complete_gifted_experience_step', { p_assignment: current.assignmentId, p_step: stepId });
      setItems(old => old.map(item => item.assignmentId === next.assignmentId ? next : item));
    } catch (completeError) { setError(completeError.message || 'Could not save your progress.'); } finally { setBusy(false); }
  }
  return <main className="mx-auto w-full max-w-5xl space-y-6 p-5 text-gray-900">
    <div><p className="text-sm font-semibold uppercase tracking-wider text-blue-800">Guided learning</p><h1 className="text-3xl font-semibold">My Gifted Experience</h1><p className="mt-2 max-w-3xl text-gray-600">A continuous route from discovering your starting point to becoming ready for competitions and opportunities.</p></div>
    {error && <div role="alert" className="border-l-4 border-red-600 bg-red-50 p-4">{error}<button className="ml-4 underline" disabled={busy} onClick={load}>Retry</button></div>}
    {busy && <p role="status">Updating your journey...</p>}
    {!busy && !error && !items.length && <section className="rounded-xl border bg-white p-6"><h2 className="text-xl font-semibold">Your guided route is being prepared</h2><p className="mt-2 text-gray-600">You can still explore Tracks, learning materials, assessments, competitions, and camps freely.</p><Link className={`${button} mt-4`} to="/tracks">Browse my tracks</Link></section>}
    {!!items.length && current && <>
      {items.length > 1 && <label className="block max-w-lg">Choose a track journey<select className="mt-1 min-h-11 w-full rounded-lg border px-3" value={current.assignmentId} onChange={event => setSelectedId(event.target.value)}>{items.map(item => <option key={item.assignmentId} value={item.assignmentId}>{item.snapshot.title}</option>)}</select></label>}
      <section className="rounded-xl border bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-semibold">{current.snapshot.title}</h2><p className="mt-2 max-w-2xl text-gray-600">{current.snapshot.description}</p></div><p className="rounded-full bg-blue-50 px-4 py-2 font-medium text-blue-900">{completedCount}/{steps.length} stages complete</p></div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-teal-700 transition-all" style={{ width: `${steps.length ? completedCount / steps.length * 100 : 0}%` }}/></div>
        {!!current.findings?.length && <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-950">This route now reflects your diagnostic results. Stages that do not apply have been left out, and your progress is preserved.</p>}
      </section>
      {!!current.recommendations?.length && <section className="rounded-xl border bg-white p-6"><h2 className="text-xl font-semibold">Recommended for your results</h2><p className="mt-1 text-gray-600">These resources and opportunities match the skills shown in your diagnostic report.</p><div className="mt-4 grid gap-4 md:grid-cols-2">{current.recommendations.map(item => <article key={item.id} className="rounded-lg border border-gray-200 p-4"><p className="text-sm font-semibold uppercase tracking-wide text-blue-800">{item.skill?.name || 'Measured skill'} · {item.status}</p><h3 className="mt-1 text-lg font-semibold">{item.title}</h3>{item.description && <p className="mt-2 text-gray-600">{item.description}</p>}<Link className={`${button} mt-4`} to={item.href}>Open {item.type}</Link></article>)}</div></section>}
      <ol className="space-y-4">{steps.map((step, index) => {
        const done = !!current.completed?.[step.id], active = current.currentStepId === step.id, locked = !done && !active;
        return <li key={step.id} className={`rounded-xl border bg-white p-5 ${active ? 'border-blue-700 ring-2 ring-blue-100' : 'border-gray-200'} ${locked ? 'opacity-60' : ''}`}>
          <div className="flex items-start gap-4"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold ${done ? 'bg-teal-700 text-white' : active ? 'bg-blue-900 text-white' : 'bg-gray-200'}`}>{done ? '✓' : index + 1}</span><div className="flex-1"><p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{labels[step.type] || step.type}{active ? ' · Current stage' : ''}</p><h3 className="text-xl font-semibold">{step.title}</h3>{step.description && <p className="mt-2 text-gray-600">{step.description}</p>}
            {done && <p className="mt-3 font-medium text-teal-800">Completed</p>}
            {active && !done && <div className="mt-4 flex flex-wrap gap-3"><Link className={button} to={step.href}>{step.type === 'diagnostic' ? 'Take my diagnostic' : 'Open this stage'}</Link>{step.type !== 'diagnostic' && <button disabled={busy} className={button} onClick={() => complete(step.id)}>I’ve completed this stage</button>}</div>}
            {locked && <p className="mt-3 text-sm">Complete the current stage to unlock this one.</p>}
          </div></div>
        </li>;
      })}</ol>
      {current.isComplete && <section className="rounded-xl border border-teal-300 bg-teal-50 p-6"><h2 className="text-2xl font-semibold">You completed this Gifted Experience</h2><p className="mt-2">Review competitions and opportunities that match the capabilities you have developed.</p><div className="mt-4 flex gap-3"><Link className={button} to="/programs">View competitions</Link><Link className={button} to="/tracks">View opportunities</Link></div></section>}
    </>}
  </main>;
}
