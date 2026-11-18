import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const nextSteps = { 'Insufficient evidence': 'More questions are needed before drawing a conclusion.', 'Verify this skill': 'Try fresh questions to check these mixed results.', 'Demonstrated strength': 'A fresh checkpoint can confirm your readiness for the next stage.', 'Needs development': 'Focus your learning and practice on this skill, then reassess.' };
export default function LearnerDiagnostics() {
  const [items,setItems]=useState([]), [current,setCurrent]=useState(null), [answers,setAnswers]=useState({});
  const [busy,setBusy]=useState(false), [error,setError]=useState(''), [dirty,setDirty]=useState(false), [notice,setNotice]=useState('');
  async function rpc(name,args) { const {data,error}=await supabase.rpc(name,args).abortSignal(AbortSignal.timeout(20000)); if(error) throw error; return data; }
  async function load() { setBusy(true); setError(''); try { const {data}=await supabase.auth.getUser(); if(!data.user) throw new Error('Sign in to view your diagnostics.'); setItems(await rpc('my_diagnostics')); } catch(e) {setError(e.message);} finally {setBusy(false);} }
  useEffect(()=>{load();},[]);
  useEffect(()=>{ const warn=e=>{if(dirty){e.preventDefault();e.returnValue='';}}; const leave=e=>{if(dirty&&e.target.closest('a')&&!window.confirm('Leave without saving your latest answers?')){e.preventDefault();e.stopPropagation();}}; window.addEventListener('beforeunload',warn);document.addEventListener('click',leave,true);return()=>{window.removeEventListener('beforeunload',warn);document.removeEventListener('click',leave,true);};},[dirty]);
  async function open(id) {setBusy(true);setError('');setNotice('');try{const data=await rpc('learner_diagnostic',{p_assignment:id});setCurrent({...data,id});setAnswers(data.attempt.answers);setDirty(false);}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function save(submit=false,pause=false) {
    if(submit&&!window.confirm('Submit your answers for a final diagnostic report?'))return;
    setBusy(true);setError('');try{
      const data=await rpc('learner_diagnostic',{p_assignment:current.id,p_answers:answers,p_revision:current.attempt.revision});setCurrent({...data,id:current.id});setDirty(false);setNotice('Your answers are saved to your account.');
      if(submit){const report=await rpc('submit_diagnostic',{p_assignment:current.id,p_revision:data.attempt.revision});setCurrent({...data,id:current.id,attempt:{...data.attempt,report}});}
      if(pause){setCurrent(null);await load();}
    }catch(e){setError(e.message||'Could not save your latest answers. Keep this page open and retry.');}finally{setBusy(false);}
  }
  const button='min-h-11 rounded bg-blue-800 px-4 py-2 text-white disabled:opacity-50';
  const report=current?.attempt.report;
  return <main className="mx-auto w-full max-w-4xl space-y-6 p-5 text-gray-900">
    <h1 className="text-3xl font-semibold">Your diagnostics</h1><p>Discover the skills you can demonstrate and the areas to work on next.</p>
    {error&&<div role="alert" className="border-l-4 border-red-600 bg-red-50 p-4">{error}<button disabled={busy} className="ml-4 underline" onClick={()=>{if(!dirty||window.confirm('Reload saved answers and discard your unsaved changes?'))current?open(current.id):load();}}>Reload saved progress</button></div>}
    {notice&&<p role="status">{notice}</p>}{busy&&<p role="status">Updating your diagnostic progress...</p>}
    {!current&&!busy&&!error&&!items.length&&<p>No diagnostic has been assigned to you yet.</p>}
    {!current&&items.map(item=><section key={item.id} className="border-t py-5"><h2 className="text-xl font-semibold">{item.title}</h2><p>{item.audience} · Version {item.version} · {item.answered} answers saved</p><button disabled={busy} className={button} onClick={()=>open(item.id)}>{item.submitted?'View my report':item.answered?'Resume my diagnostic':'Start my diagnostic'}</button></section>)}
    {current&&<><h2 className="text-2xl font-semibold">{current.paper.title}</h2>{report?<>
      <p>Your results reflect this diagnostic, not the limits of your potential.</p>{report.findings.map(f=><section key={f.skill.id} className="border-l-4 border-teal-700 pl-4"><h3 className="text-xl font-semibold">{f.skill.topic}: {f.skill.name}</h3><p>{f.status} · {f.correct}/{f.answered} answered correctly · {f.total-f.answered} unanswered</p><p>{nextSteps[f.status]}</p></section>)}
      <h3 className="text-xl font-semibold">Your question evidence</h3>{report.questions.map((q,i)=><section key={q.id} className="border-t py-4"><p>{i+1}. {q.prompt}</p><p>Your answer: {report.answers[q.id]===undefined?'Unanswered':q.options[report.answers[q.id]]}</p><p>Correct answer: {q.options[q.correctIndex]}</p><p>{q.explanation}</p></section>)}<div className="flex flex-wrap gap-3"><Link className={button} to="/gifted-experience">Continue my Gifted Experience</Link><button className={button} onClick={()=>{setCurrent(null);load();}}>Back to my diagnostics</button></div>
    </>:<><p className="whitespace-pre-wrap">{current.paper.instructions}</p><p>{Object.keys(answers).length} of {current.paper.questions.length} answered · {dirty?'Latest changes need saving':'Saved to your account'}</p>
      <fieldset disabled={busy} className="space-y-6">{current.paper.questions.map((q,i)=><fieldset key={q.id} className="border-t pt-5"><legend className="whitespace-pre-wrap font-semibold">{i+1}. {q.prompt}</legend>{q.options.map((option,n)=><label key={n} className="flex min-h-11 items-center gap-3"><input type="radio" name={q.id} checked={answers[q.id]===n} onChange={()=>{setAnswers(a=>({...a,[q.id]:n}));setDirty(true);setNotice('');}}/>{option}</label>)}</fieldset>)}</fieldset>
      <div className="flex flex-wrap gap-3"><button disabled={busy} className={button} onClick={()=>save()}>Save my answers</button><button disabled={busy} className={button} onClick={()=>save(false,true)}>Save and pause</button><button disabled={busy} className={button} onClick={()=>save(true)}>Submit for my report</button></div>
    </>}</>}
  </main>;
}
