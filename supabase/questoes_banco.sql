-- ================================================================
-- MEDQUEST — Banco de Questões de Residência Médica
-- 100 questões cobrindo as principais especialidades
-- Execute no Supabase > SQL Editor
-- ================================================================

-- Garante que todos os subtemas necessários existem
insert into subtemas (tema_id, nome)
select t.id, s.nome from temas t
join (values
  ('Cardiologia','Insuficiência Cardíaca'),
  ('Cardiologia','Síndrome Coronariana Aguda'),
  ('Cardiologia','Arritmias'),
  ('Cardiologia','Hipertensão Arterial'),
  ('Cardiologia','Valvopatias'),
  ('Infectologia','Meningites'),
  ('Infectologia','HIV/AIDS'),
  ('Infectologia','Tuberculose'),
  ('Infectologia','Pneumonias'),
  ('Infectologia','Hepatites'),
  ('Neurologia','AVC'),
  ('Neurologia','Epilepsia'),
  ('Neurologia','Cefaleias'),
  ('Pneumologia','Asma'),
  ('Pneumologia','DPOC'),
  ('Pneumologia','TEP'),
  ('Gastroenterologia','Esôfago'),
  ('Gastroenterologia','Estômago'),
  ('Gastroenterologia','Fígado'),
  ('Gastroenterologia','Intestino'),
  ('Endocrinologia','Diabetes Mellitus'),
  ('Endocrinologia','Tireoide'),
  ('Endocrinologia','Adrenal'),
  ('Nefrologia','IRA'),
  ('Nefrologia','IRC'),
  ('Nefrologia','Distúrbios Ácido-Base'),
  ('Reumatologia','LES'),
  ('Reumatologia','Artrite Reumatoide'),
  ('Hematologia','Anemias'),
  ('Hematologia','Hemostasia'),
  ('Pediatria','Neonatologia'),
  ('Pediatria','Doenças Exantemáticas'),
  ('Ginecologia','Câncer Ginecológico'),
  ('Ginecologia','Endometriose'),
  ('Obstetrícia','Síndromes Hipertensivas'),
  ('Obstetrícia','Diabetes Gestacional'),
  ('Cirurgia','Trauma'),
  ('Cirurgia','Hérnias'),
  ('Preventiva','Epidemiologia'),
  ('Preventiva','SUS')
) as s(tema_nome, nome) on t.nome = s.tema_nome
where not exists (
  select 1 from subtemas sub2 where sub2.tema_id = t.id and sub2.nome = s.nome
);

-- ================================================================
-- HELPER: insere questão + alternativas de uma vez
-- ================================================================

-- ================================================================
-- CARDIOLOGIA > INSUFICIÊNCIA CARDÍACA (5 questões)
-- ================================================================

with sub as (select id from subtemas where nome='Insuficiência Cardíaca' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Homem de 62 anos, hipertenso há 15 anos, chega ao PS com dispneia progressiva há 3 dias, ortopneia e edema de MMII. Ao exame: B3, crepitações bibasais, JVP elevada. Qual é o diagnóstico e o tratamento inicial de escolha?',
'Insuficiência cardíaca descompensada com congestão: B3, crepitações, jugular ingurgitada e edema. Tratamento inicial: diurético de alça (furosemida IV) para reduzir a congestão. B3 (galope) é patognomônico de IC com disfunção diastólica ou sistólica.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','IC descompensada; furosemida IV',true),
('B','IC descompensada; metoprolol IV',false),
('C','Síndrome nefrótica; albumina IV',false),
('D','TEP; heparina IV',false),
('E','Pneumonia; amoxicilina + clavulanato',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Insuficiência Cardíaca' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Paciente com IC com fração de ejeção reduzida (FEr) em uso de furosemida e digoxina. Qual combinação medicamentosa tem evidência de redução de mortalidade nessa condição?',
'Na ICFEr (FE < 40%), a terapia com comprovada redução de mortalidade inclui: IECA (ou BRA), betabloqueador e antagonista da aldosterona (espironolactona). Os betabloqueadores com evidência são carvedilol, metoprolol succinato e bisoprolol. O IECA/BRA reduz pós-carga e remodelamento cardíaco.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Furosemida + digoxina + nifedipina',false),
('B','IECA + betabloqueador + espironolactona',true),
('C','Amiodarona + digoxina + hidralazina',false),
('D','BRA + furosemida + anlodipino',false),
('E','Digoxina + espironolactona + diltiazem',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Insuficiência Cardíaca' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2023',
'Mulher de 58 anos com IC com fração de ejeção preservada (FEp, FE=58%). Qual é a principal estratégia de tratamento para alívio sintomático?',
'Na ICFEp (FE ≥ 50%), não há droga com redução de mortalidade claramente demonstrada. O tratamento visa controle dos fatores de risco (HAS, FA, DM), alívio dos sintomas com diuréticos e controle da frequência cardíaca. Betabloqueadores e IECA/BRA podem ser usados para controle das comorbidades.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Carvedilol para redução de mortalidade',false),
('B','Controle dos fatores de risco e diuréticos para sintomas',true),
('C','Digoxina em dose plena',false),
('D','Hidralazina + nitrato para redução de mortalidade',false),
('E','Amiodarona profilática',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Insuficiência Cardíaca' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2022',
'Paciente com IC classe funcional IV (NYHA) em uso de terapia otimizada. Qual exame é fundamental para avaliar candidatura a transplante cardíaco?',
'O VO2 máximo no teste ergoespirométrico (< 14 mL/kg/min ou < 50% do previsto) é critério para indicação de transplante cardíaco. Também se usa o escore SHFM e o BNP/NT-proBNP para estratificação de prognóstico em IC avançada.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Ecocardiograma com doppler tecidual',false),
('B','Teste ergoespirométrico com VO2 máximo',true),
('C','Cateterismo cardíaco direito isolado',false),
('D','Holter 24h',false),
('E','Angiotomografia coronariana',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Insuficiência Cardíaca' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'UNICAMP 2023',
'Homem de 70 anos com IC e FA. BNP = 1800 pg/mL. Qual a principal utilidade clínica do BNP na IC?',
'O BNP (peptídeo natriurético tipo B) e o NT-proBNP são marcadores de estresse miocárdico. São úteis para: diagnóstico de IC em cenário de dispneia aguda, estratificação prognóstica e monitorização de resposta ao tratamento. BNP > 400 pg/mL tem alta sensibilidade para IC descompensada.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Diagnóstico de infarto agudo do miocárdio',false),
('B','Diagnóstico e estratificação prognóstica da IC',true),
('C','Detecção de embolia pulmonar',false),
('D','Avaliação de função renal na IC',false),
('E','Guia para dosagem de anticoagulante',false)) as alt(letra,texto,correta);

-- ================================================================
-- CARDIOLOGIA > SCA (5 questões)
-- ================================================================

with sub as (select id from subtemas where nome='Síndrome Coronariana Aguda' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Homem de 55 anos com dor precordial intensa há 1 hora, irradiada para membro superior esquerdo. ECG: supradesnível de ST em V1-V4. Troponina I: 0,02 ng/mL (referência < 0,04). Qual a conduta imediata?',
'IAMCSST: supradesnível de ST + sintomas isquêmicos. A troponina pode estar normal nas primeiras horas (janela enzimática). A conduta imediata é AAS + heparina + reperfusão (ICP primária em até 90 min ou trombólise se ICP indisponível em 120 min). Não aguardar troponina para iniciar reperfusão!' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Aguardar nova troponina em 3h antes de decidir',false),
('B','AAS + heparina + reperfusão imediata (ICP primária)',true),
('C','AAS + nitrato + alta hospitalar com seguimento ambulatorial',false),
('D','Betabloqueador IV + morfina + oxigênio a 10L/min',false),
('E','Ecocardiograma urgente para confirmar diagnóstico',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Síndrome Coronariana Aguda' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Mulher de 65 anos com dor precordial há 3h, sudorese e ECG sem supradesnível de ST. Troponina T: 0,08 ng/mL (valor de referência < 0,014 ng/mL). Qual o diagnóstico e a conduta?',
'IAMSST: sintomas isquêmicos + troponina elevada sem supradesnível de ST. Diferencia de angina instável (troponina normal). Conduta: antiagregação dupla (AAS + ticagrelor/clopidogrel), anticoagulação, estratificação de risco e cateterismo em até 24-72h conforme risco.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Angina instável; alta com AAS',false),
('B','IAMSST; antiagregação dupla + anticoagulação + estratificação',true),
('C','IAMCSST; reperfusão imediata',false),
('D','Espasmo coronariano; nitrato sublingual e alta',false),
('E','Pericardite aguda; AAS em dose alta + colchicina',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Síndrome Coronariana Aguda' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2022',
'Após ICP primária por IAMCSST, qual a duração recomendada da dupla antiagregação plaquetária (AAS + inibidor P2Y12)?',
'Após ICP com stent farmacológico por SCA, a dupla antiagregação deve ser mantida por pelo menos 12 meses (AAS + ticagrelor ou prasugrel). O ticagrelor é preferido ao clopidogrel nas SCA. AAS é mantido indefinidamente. A interrupção precoce aumenta risco de trombose de stent.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','1 mês',false),
('B','3 meses',false),
('C','6 meses',false),
('D','12 meses',true),
('E','Indefinidamente com dupla antiagregação',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Síndrome Coronariana Aguda' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2021',
'Paciente com IAMCSST em hospital sem hemodinâmica. O tempo estimado para transferência e ICP primária é de 160 minutos. Qual a conduta mais adequada?',
'Quando o tempo porta-balão (ICP) ultrapassa 120 minutos, a trombólise farmacológica é preferida (se sem contraindicações). O agente de escolha é a tenecteplase (TNK-tPA) em dose única. Após trombólise, o paciente deve ser transferido para coronariografia em 3-24 horas (estratégia farmacoinvasiva).' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Aguardar transferência e realizar ICP primária',false),
('B','Trombólise imediata com tenecteplase + transferência para coronariografia em 3-24h',true),
('C','Apenas AAS + heparina e transferência eletiva',false),
('D','Cirurgia de revascularização de urgência local',false),
('E','Trombólise com estreptoquinase + manutenção no hospital local',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Síndrome Coronariana Aguda' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'UNICAMP 2022',
'Qual marcador tem maior especificidade para necrose miocárdica no diagnóstico de IAM?',
'A troponina I e T cardíacas são os marcadores mais sensíveis e específicos para necrose miocárdica. A troponina ultrassensível permite diagnóstico mais precoce (1-2h). A CK-MB é menos específica (pode elevar em miosite, lesão muscular). Mioglobina: precoce mas inespecífica. LDH: tardio.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','CK total',false),
('B','Mioglobina',false),
('C','Troponina I ou T cardíaca',true),
('D','LDH',false),
('E','AST (TGO)',false)) as alt(letra,texto,correta);

-- ================================================================
-- CARDIOLOGIA > HIPERTENSÃO (3 questões)
-- ================================================================

with sub as (select id from subtemas where nome='Hipertensão Arterial' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Paciente hipertenso, diabético tipo 2, com microalbuminúria. Qual a classe de anti-hipertensivo de primeira escolha nesse paciente?',
'Em hipertensos diabéticos com nefropatia (microalbuminúria ou proteinúria), os IECA ou BRA são a primeira escolha pois têm efeito nefroprotetor adicional, reduzindo a progressão da nefropatia diabética independentemente do efeito anti-hipertensivo. Alvo de PA: < 130/80 mmHg.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Betabloqueador',false),
('B','Bloqueador de canal de cálcio dihidropiridínico',false),
('C','IECA ou BRA',true),
('D','Diurético tiazídico',false),
('E','Alfa-bloqueador',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Hipertensão Arterial' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2023',
'Paciente com PA = 210/130 mmHg, cefaleia intensa, mas sem lesão de órgão-alvo ao exame. Como classificar e tratar?',
'Urgência hipertensiva: PA muito elevada sem LOA aguda. Diferencia de emergência (com LOA aguda: encefalopatia, edema agudo de pulmão, dissecção aórtica). Na urgência, redução gradual da PA em 24-48h com anti-hipertensivos VO (captopril, clonidina). Emergência: nítroprussiato de sódio IV.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Emergência hipertensiva; nítroprussiato de sódio IV imediato',false),
('B','Urgência hipertensiva; redução gradual da PA com medicação oral em 24-48h',true),
('C','Urgência hipertensiva; redução da PA em 1 hora com nifedipina sublingual',false),
('D','Hipertensão estágio 3; alta com ajuste da medicação ambulatorial',false),
('E','Emergência hipertensiva; labetalol IV',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Hipertensão Arterial' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2022',
'Hipertenso jovem (28 anos), PA 160/100 mmHg, hipocalemia sem uso de diurético, incidentaloma adrenal. O que investigar prioritariamente?',
'Hiperaldosteronismo primário (síndrome de Conn): hipertensão + hipocalemia espontânea + supressão de renina + excesso de aldosterona. Causa mais comum de HAS secundária. Diagnóstico: relação aldosterona/renina elevada. Confirmação: teste de supressão com fludrocortisona ou sobrecarga salina.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Feocromocitoma: catecolaminas urinárias',false),
('B','Hiperaldosteronismo primário: relação aldosterona/renina',true),
('C','Síndrome de Cushing: cortisol urinário de 24h',false),
('D','HAS renovascular: angiotomografia de artérias renais',false),
('E','Coarctação de aorta: ecocardiograma',false)) as alt(letra,texto,correta);

-- ================================================================
-- INFECTOLOGIA > HIV/AIDS (5 questões)
-- ================================================================

with sub as (select id from subtemas where nome='HIV/AIDS' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Paciente HIV+ com CD4 = 85 células/mm³, febre, tosse seca e dispneia progressiva há 2 semanas. RX: infiltrado intersticial bilateral. LDH elevado. Qual o diagnóstico mais provável e o tratamento?',
'Pneumocistose (PCP) por Pneumocystis jirovecii: principal infecção oportunista em HIV com CD4 < 200. Apresentação clássica: dispneia progressiva, tosse seca, febre, LDH elevado, infiltrado intersticial bilateral "em vidro fosco". Tratamento: sulfametoxazol-trimetoprim (SMX-TMP) em altas doses. Corticoide se PaO2 < 70 mmHg.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Tuberculose pulmonar; RHZ',false),
('B','Pneumocistose (PCP); sulfametoxazol-trimetoprim em altas doses',true),
('C','Pneumonia bacteriana; amoxicilina-clavulanato',false),
('D','Histoplasmose; anfotericina B',false),
('E','CMV pulmonar; ganciclovir',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='HIV/AIDS' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'HIV+ com CD4 = 45/mm³ apresenta cefaleia, febre e confusão mental. LCR: pressão elevada, tinta da China positivo. Qual o diagnóstico e conduta?',
'Meningite criptocócica: infecção oportunista grave em HIV com CD4 < 100. Diagnóstico: antígeno criptocócico no LCR ou sangue, tinta da China positivo. Tratamento de indução: anfotericina B lipossomal + 5-fluorocitosina por 2 semanas, seguido de fluconazol de consolidação (8 sem) e manutenção. Punções lombares aliviantes se hipertensão intracraniana.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Toxoplasmose cerebral; sulfadiazina + pirimetamina',false),
('B','Meningite criptocócica; anfotericina B + 5-fluorocitosina',true),
('C','Meningite tuberculosa; RHZE',false),
('D','Neurossífilis; penicilina G cristalina IV',false),
('E','Linfoma primário do SNC; corticoide',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='HIV/AIDS' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2023',
'Qual o critério laboratorial que define AIDS segundo o CDC/Ministério da Saúde do Brasil?',
'Critério imunológico de AIDS: CD4 < 200 células/mm³ ou CD4/CD4+CD8 < 14%, independente de sintomas. Critério clínico: presença de doença definidora de AIDS (pneumocistose, toxoplasmose cerebral, criptococose meníngea, CMV, etc.). No Brasil, o diagnóstico de AIDS também pode ser feito por critério de Caracas ou Rio de Janeiro.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Carga viral do HIV > 100.000 cópias/mL',false),
('B','CD4 < 200 células/mm³ ou presença de condição definidora de AIDS',true),
('C','CD4 < 350 células/mm³',false),
('D','Soroconversão com teste ELISA positivo',false),
('E','Western Blot positivo com sintomas gripais',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='HIV/AIDS' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2022',
'HIV+ com lesões cutâneas violáceas em membros inferiores e mucosa oral. Biópsia: proliferação vascular com células fusiformes e hemácias extravasadas. Qual o diagnóstico?',
'Sarcoma de Kaposi: neoplasia associada ao HHV-8 (herpesvírus humano 8), mais prevalente em HIV+. Lesões violáceas/eritematosas em pele, mucosas e vísceras. Tratamento: TARV (frequentemente leva à regressão). Casos avançados: quimioterapia com doxorrubicina lipossomal.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Melanoma maligno',false),
('B','Linfoma cutâneo de células T',false),
('C','Sarcoma de Kaposi',true),
('D','Angiossarcoma',false),
('E','Leishmaniose tegumentar',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='HIV/AIDS' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'UNICAMP 2023',
'Gestante HIV+ com 28 semanas, em TARV, com carga viral indetectável. Qual a via de parto recomendada e quando iniciar AZT intraparto?',
'Gestante HIV+ com CV indetectável (< 1000 cópias) no 3º trimestre pode ter parto vaginal. AZT IV deve ser iniciado no início do trabalho de parto ou 3h antes da cesariana. Se CV > 1000 cópias ou desconhecida: cesárea eletiva com 38 semanas. RN deve receber AZT por 4 semanas.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Cesariana obrigatória; AZT IV 24h antes',false),
('B','Parto vaginal permitido se CV indetectável; AZT IV no trabalho de parto',true),
('C','Parto vaginal sempre; sem necessidade de AZT intraparto',false),
('D','Cesariana eletiva com 36 semanas independente da CV',false),
('E','Parto vaginal apenas se CD4 > 500',false)) as alt(letra,texto,correta);

-- ================================================================
-- INFECTOLOGIA > TUBERCULOSE (4 questões)
-- ================================================================

with sub as (select id from subtemas where nome='Tuberculose' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2022',
'Adulto com tosse há 3 semanas, hemoptise, sudorese noturna e perda de 8 kg em 2 meses. RX: cavitação no lobo superior direito. Baciloscopia positiva (2+). Qual o esquema de tratamento?',
'Tuberculose pulmonar bacilífera: esquema RHZE por 2 meses (fase intensiva) + RH por 4 meses (fase de manutenção) = 6 meses no total. Rifampicina (R), Isoniazida (H), Pirazinamida (Z), Etambutol (E). Notificação compulsória. Isolar até 3 baciloscopias negativas ou 2 semanas de tratamento.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','RH por 6 meses',false),
('B','RHZE por 2 meses + RH por 4 meses (total 6 meses)',true),
('C','RHZE por 6 meses',false),
('D','RHZ por 9 meses',false),
('E','Amoxicilina + claritromicina por 3 semanas',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Tuberculose' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2023',
'Criança de 4 anos, contactante de adulto com TB, PT (PPD) = 12 mm, RX tórax normal, assintomática. Qual a conduta?',
'Infecção latente por TB (ILTB): PT ≥ 5mm em imunossuprimidos e ≥ 10mm na população geral com contato recente. RX normal + assintomática = ILTB. Tratamento: isoniazida por 9 meses ou rifampicina por 4 meses (profilaxia). Não é TB ativa, não precisa de RHZE.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Nenhuma conduta; observação',false),
('B','RHZE por 6 meses (tratar como TB ativa)',false),
('C','Isoniazida por 9 meses (tratamento de ILTB)',true),
('D','Vacinação BCG reforço',false),
('E','Broncoscopia para confirmar diagnóstico',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Tuberculose' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2022',
'Paciente com TB em tratamento há 1 mês evolui com icterícia e hepatite medicamentosa grave (TGO = 10x LSN). Qual a conduta?',
'Hepatotoxicidade grave pelo esquema RHZE: definida por ALT/AST > 5x LSN (ou > 3x com sintomas). Conduta: suspender R, H e Z (os três hepatotóxicos). Manter etambutol + estreptomicina/fluoroquinolona como esquema de substituição. Reintroduzir após normalização das enzimas.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Manter o esquema e dosar novamente em 2 semanas',false),
('B','Suspender apenas a pirazinamida',false),
('C','Suspender R, H e Z; manter etambutol + esquema alternativo',true),
('D','Suspender todo o tratamento por 1 mês',false),
('E','Reduzir as doses pela metade',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Tuberculose' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2021',
'Qual é o método diagnóstico de maior especificidade para tuberculose pulmonar?',
'A cultura de escarro em meio sólido (Löwenstein-Jensen) ou líquido (MGIT) é o padrão-ouro com maior especificidade para TB. Permite identificação da espécie e teste de sensibilidade. A baciloscopia (Ziehl-Neelsen) tem alta especificidade quando positiva mas menor sensibilidade. O Xpert MTB/RIF (PCR) tem alta sensibilidade e especificidade e detecta resistência à rifampicina.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Baciloscopia de escarro',false),
('B','Radiografia de tórax',false),
('C','Cultura de escarro (padrão-ouro)',true),
('D','PPD (teste tuberculínico)',false),
('E','IGRA (Quantiferon)',false)) as alt(letra,texto,correta);

-- ================================================================
-- NEUROLOGIA > AVC (5 questões)
-- ================================================================

with sub as (select id from subtemas where nome='AVC' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Paciente de 70 anos chega ao PS com hemiplegia direita e afasia há 1 hora. TC de crânio sem contraste: sem sangramento. Qual a conduta imediata?',
'AVC isquêmico agudo: janela terapêutica para trombólise IV (alteplase) é de até 4,5 horas do início dos sintomas (em selecionados). Critérios de exclusão incluem: TC com hemorragia, PA > 185/110 mmHg, uso de anticoagulante, glicemia < 50 ou > 400. A trombectomia mecânica é opção em até 24h em centros especializados (grandes vasos).' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Heparina IV imediata',false),
('B','Alteplase IV (trombólise) se sem contraindicações',true),
('C','AAS 500mg + alta com anticoagulante oral',false),
('D','TC com contraste e aguardar resultado antes de qualquer conduta',false),
('E','Betabloqueador para controle de PA + internação para observação',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='AVC' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Paciente com FA sem anticoagulação sofre AVC isquêmico. Escore NIHSS = 4. Quando iniciar anticoagulação oral?',
'Na FA com AVC isquêmico, a anticoagulação previne recorrência. Timing: AVC minor (NIHSS ≤ 3): iniciar em 1-3 dias. AVC moderado (NIHSS 4-15): 6-8 dias. AVC grave (NIHSS > 15) ou com transformação hemorrágica: 12-14 dias. Regra 1-3-6-12: minor, moderado, grave, transformação hemorrágica.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Imediatamente após o AVC',false),
('B','6-8 dias após o AVC (AVC moderado)',true),
('C','6 meses após o AVC',false),
('D','Nunca; manter apenas AAS',false),
('E','Após RNM mostrar ausência de transformação hemorrágica, independente do tempo',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='AVC' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2023',
'Jovem de 35 anos com cefaleia "em trovão" de início súbito. TC: hiperdensidade nas cisternas basais. Qual o diagnóstico e conduta?',
'HSA (hemorragia subaracnóidea): cefaleia "em trovão" + sangue nas cisternas basais na TC = aneurisma roto até prova em contrário. Conduta: nimodipina (previne vasoespasmo), controle da PA, arteriografia para identificar e tratar o aneurisma (clipagem ou embolização). Punção lombar se TC normal e suspeita clínica.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Enxaqueca com aura; sumatriptano',false),
('B','Meningite bacteriana; ceftriaxona',false),
('C','HSA por ruptura de aneurisma; nimodipina + arteriografia + tratamento cirúrgico',true),
('D','AVC isquêmico; trombólise',false),
('E','Trombose de seio venoso; heparina',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='AVC' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2022',
'Paciente com AVC isquêmico há 3 dias. PA = 170/95 mmHg. Qual a conduta em relação à hipertensão arterial?',
'Na fase aguda do AVC isquêmico (primeiros dias), a hipertensão é permissiva (autorregulação cerebral comprometida): não tratar se PA < 220/120 mmHg (salvo se candidato a trombólise: meta < 185/110 antes, < 180/105 após). A redução abrupta pode piorar a isquemia. Após fase aguda (7-10 dias): iniciar anti-hipertensivos para prevenção secundária.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Reduzir PA imediatamente para < 140/90 mmHg',false),
('B','Manter hipertensão permissiva; tratar apenas se PA > 220/120 mmHg',true),
('C','Nítroprussiato IV para PA < 130/80 mmHg',false),
('D','Metoprolol IV imediato',false),
('E','Tratar apenas se PA > 180/110 mmHg em qualquer fase do AVC',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='AVC' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'UNICAMP 2022',
'Qual é o principal fator de risco modificável para AVC isquêmico?',
'A hipertensão arterial é o principal fator de risco modificável para AVC isquêmico e hemorrágico, responsável por aproximadamente 35-50% dos casos. Outros fatores importantes: FA, tabagismo, diabetes, dislipidemia, sedentarismo.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Diabetes mellitus',false),
('B','Hipertensão arterial sistêmica',true),
('C','Fibrilação atrial',false),
('D','Tabagismo',false),
('E','Obesidade',false)) as alt(letra,texto,correta);

-- ================================================================
-- PNEUMOLOGIA > ASMA (3 questões)
-- ================================================================

with sub as (select id from subtemas where nome='Asma' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Paciente asmático em crise, SpO2 = 88%, FR = 28 irpm, uso intenso de musculatura acessória, sem melhora após 3 doses de broncodilatador. Como classificar e tratar?',
'Crise grave de asma: uso intenso de musculatura acessória, SpO2 < 90%, FR > 25, ausência de melhora com broncodilatador. Conduta: O2 suplementar (alvo SpO2 > 94%), SABA (salbutamol) nebulizado repetido, ipratrópio associado, corticoide sistêmico (prednisona ou metilprednisolona IV), considerar sulfato de magnésio IV em casos graves refratários.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Crise leve; alta com salbutamol inalatório',false),
('B','Crise grave; O2 + SABA repetido + corticoide sistêmico + considerar MgSO4',true),
('C','Crise moderada; nebulização e observação por 1h',false),
('D','Status asmaticus; intubação imediata',false),
('E','Crise grave; aminofilina IV como primeira linha',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Asma' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Adulto com asma persistente moderada, com sintomas diários e acordar noturno 3-4x/semana. Qual o tratamento de manutenção de escolha?',
'Asma persistente moderada (degrau 3-4 GINA): corticoide inalatório em dose média + LABA (broncodilatador de longa duração). A combinação budesonida+formoterol ou fluticasona+salmeterol é a terapia padrão. LABA nunca deve ser usado em monoterapia na asma (risco de morte). Leukotrienios são alternativa menos eficaz.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','SABA (salbutamol) em uso regular',false),
('B','Corticoide inalatório em dose baixa isolado',false),
('C','Corticoide inalatório em dose média + LABA',true),
('D','LABA em monoterapia',false),
('E','Teofilina oral + corticoide inalatório baixa dose',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Asma' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2022',
'No diagnóstico funcional da asma, qual achado na espirometria confirma o diagnóstico?',
'Asma: obstrução reversível ao fluxo aéreo. Espirometria: VEF1/CVF < 0,7 (padrão obstrutivo) com resposta ao broncodilatador (aumento do VEF1 ≥ 12% e ≥ 200 mL após salbutamol). Variabilidade do PFE > 10-20% também é critério. Espirometria normal não exclui asma (fazer teste de provocação brônquica com metacolina se normal).' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','CVF reduzida com VEF1 normal',false),
('B','Obstrução (VEF1/CVF < 0,7) reversível após broncodilatador (↑VEF1 ≥ 12% e ≥ 200mL)',true),
('C','Padrão restritivo com CPT reduzida',false),
('D','Obstrução fixa sem resposta ao broncodilatador',false),
('E','Hiperinsuflação isolada sem obstrução',false)) as alt(letra,texto,correta);

-- ================================================================
-- PNEUMOLOGIA > DPOC (3 questões)
-- ================================================================

with sub as (select id from subtemas where nome='DPOC' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2022',
'Paciente com DPOC grave, SpO2 = 85% em ar ambiente, PaCO2 = 72 mmHg, pH = 7,28. Qual o risco da oferta excessiva de O2?',
'Na DPOC com hipercapnia crônica, o drive respiratório depende da hipóxia (o CO2 elevado crônico é tolerado). O2 excessivo pode: reduzir o drive hipóxico, piorar o V/Q, causar hipercapnia e acidose (efeito Haldane). Alvo de SpO2: 88-92%. Preferir VNI (ventilação não invasiva) na exacerbação grave com acidose.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Nenhum; oferecer O2 a 100% para corrigir hipóxia',false),
('B','Hiperoxia pode suprimir drive hipóxico e piorar hipercapnia',true),
('C','O2 suplementar é contraindicado em DPOC',false),
('D','O risco é apenas de ressecamento das vias aéreas',false),
('E','Risco de pneumonia associada ao oxigênio',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='DPOC' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Paciente com DPOC estável, VEF1 = 35% do previsto, sintomático com CAT > 20. Qual o tratamento de manutenção de primeira linha?',
'DPOC grupo E (muito sintomático + alto risco): LABA + LAMA (dupla broncodilatação de longa duração). Exemplos: formoterol+glicopirrônio, indacaterol+glicopirrônio. Corticoide inalatório é adicionado se exacerbações frequentes e eosinofilia. Reabilitação pulmonar reduz sintomas e hospitalizações.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','SABA em monoterapia',false),
('B','Corticoide inalatório em dose alta isolado',false),
('C','LABA + LAMA (dupla broncodilatação de longa duração)',true),
('D','Teofilina oral como única medicação',false),
('E','SABA + corticoide oral de manutenção',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='DPOC' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2023',
'Paciente com DPOC e exacerbação moderada: piora da dispneia, aumento da purulência e volume do escarro. Qual a intervenção que reduz mortalidade na exacerbação grave com acidose respiratória (pH < 7,35)?',
'A VNI (ventilação não invasiva — BiPAP) é a intervenção com maior redução de mortalidade na exacerbação grave de DPOC com acidose respiratória hipercápnica (pH 7,25-7,35). Reduz necessidade de intubação, mortalidade e tempo de internação. Contraindicada se: rebaixamento de consciência grave, instabilidade hemodinâmica, vômitos.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Corticoide sistêmico oral',false),
('B','Antibioticoterapia imediata',false),
('C','Ventilação não invasiva (VNI/BiPAP)',true),
('D','Metilxantinas IV',false),
('E','Intubação orotraqueal imediata',false)) as alt(letra,texto,correta);

-- ================================================================
-- PNEUMOLOGIA > TEP (3 questões)
-- ================================================================

with sub as (select id from subtemas where nome='TEP' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Paciente pós-operatório de artroplastia de quadril (5 dias) apresenta dispneia súbita, taquicardia e hipoxemia. Escore de Wells = 6. Qual a conduta diagnóstica?',
'Escore de Wells ≥ 5: TEP provável → angiotomografia pulmonar (AngioTC) diretamente. Escore < 5: dosar D-dímero (se negativo, exclui TEP; se positivo → AngioTC). Na suspeita alta, pode-se iniciar anticoagulação antes do exame se demora no diagnóstico.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Dosar D-dímero; se positivo, fazer AngioTC',false),
('B','AngioTC de tórax diretamente (Wells ≥ 5 = probabilidade alta)',true),
('C','Cintilografia V/Q como primeiro exame',false),
('D','ECG e ecocardiograma; se normais, excluir TEP',false),
('E','RX de tórax; sinal de Westermark confirma diagnóstico',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='TEP' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'TEP confirmado com choque (PAS < 90 mmHg). Qual a terapia de reperfusão de escolha e quando realizar?',
'TEP maciço (alto risco): hipotensão/choque + disfunção de VD. Indicação de trombólise sistêmica (alteplase 100 mg IV em 2h) se sem contraindicações. Contraindicações absolutas: AVC hemorrágico, cirurgia recente, sangramento ativo. Alternativa: embolectomia cirúrgica ou cateter-dirigida.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Anticoagulação plena com heparina e aguardar',false),
('B','Trombólise sistêmica com alteplase (TEP maciço com choque)',true),
('C','Filtro de veia cava inferior imediato',false),
('D','Warfarina oral de ataque',false),
('E','Trombólise apenas se AngioTC confirmar obstrução > 50%',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='TEP' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2022',
'Paciente com primeiro episódio de TEP provocado (pós-cirúrgico). Por quanto tempo deve manter anticoagulação?',
'TEP provocado (fator de risco transitório: cirurgia, imobilização, viagem): anticoagulação por 3 meses. TEP não provocado (sem fator identificável): mínimo 3-6 meses, avaliar extensão indefinida. TEP associado a neoplasia: anticoagulante direto oral (rivaroxabana, apixabana) ou HBPM indefinidamente enquanto ativo.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','1 mês',false),
('B','3 meses',true),
('C','6 meses',false),
('D','12 meses',false),
('E','Indefinidamente',false)) as alt(letra,texto,correta);

-- ================================================================
-- ENDOCRINOLOGIA > DIABETES MELLITUS (5 questões)
-- ================================================================

with sub as (select id from subtemas where nome='Diabetes Mellitus' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Paciente com DM tipo 1 chega em cetoacidose diabética (CAD): glicemia 480 mg/dL, pH 7,18, bicarbonato 8 mEq/L, cetonúria 3+. Qual a prioridade no tratamento inicial?',
'CAD: tríade hiperglicemia + acidose metabólica (pH < 7,3, HCO3 < 18) + cetonemia/cetonúria. Tratamento: 1º Expansão volêmica com SF 0,9% (1-2L na 1ª hora). 2º Insulina regular IV em bomba (após K+ > 3,5). 3º Reposição de potássio. Bicarbonato: apenas se pH < 6,9. Nunca iniciar insulina sem repor volume!' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Insulina IV imediata como primeira medida',false),
('B','Bicarbonato IV imediato para corrigir acidose',false),
('C','Expansão volêmica com SF 0,9% como primeira medida',true),
('D','Insulina SC e hidratação oral se paciente consciente',false),
('E','Glucagon IM para elevar glicemia rapidamente',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Diabetes Mellitus' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2023',
'DM tipo 2 com DCV estabelecida (IAM há 1 ano). Qual hipoglicemiante tem maior benefício cardiovascular comprovado?',
'Em DM2 com DCV estabelecida ou alto risco CV: empagliflozina e canagliflozina (iSGLT2) e liraglutida/semaglutida (aGLP1) têm redução de eventos CV comprovados em estudos outcome. Empagliflozina reduz morte CV, IAM e AVC. Também reduz hospitalização por IC e progressão de nefropatia.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Glibenclamida (sulfoniluréia)',false),
('B','Empagliflozina (iSGLT2) ou liraglutida (aGLP1)',true),
('C','Insulina NPH',false),
('D','Acarbose',false),
('E','Sitagliptina (iDPP4)',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Diabetes Mellitus' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2022',
'Critérios diagnósticos de DM: glicemia de jejum ≥ 126 mg/dL em duas ocasiões. Qual outro critério isolado é suficiente para diagnóstico?',
'Critérios diagnósticos de DM (ADA 2023): 1) Glicemia de jejum ≥ 126 mg/dL (2 ocasiões); 2) TOTG 2h ≥ 200 mg/dL; 3) HbA1c ≥ 6,5% (em laboratório certificado); 4) Glicemia aleatória ≥ 200 mg/dL com sintomas clássicos (poliúria, polidipsia, perda de peso). O critério 4 isolado confirma diagnóstico.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Glicemia pós-prandial ≥ 160 mg/dL',false),
('B','Glicemia aleatória ≥ 200 mg/dL com sintomas clássicos de DM',true),
('C','HbA1c ≥ 5,7%',false),
('D','Glicemia de jejum entre 100-125 mg/dL em duas ocasiões',false),
('E','Microalbuminúria positiva',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Diabetes Mellitus' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2022',
'Paciente com DM2 e IRC (TFG = 28 mL/min/1,73m²). Qual hipoglicemiante deve ser EVITADO?',
'Metformina: contraindicada se TFG < 30 mL/min (risco de acidose lática). Reduzir dose se TFG 30-45. Sulfoniureias (glibenclamida): evitar em IRC (acúmulo de metabólitos ativos → hipoglicemia). Insulina: dose deve ser ajustada (redução do clearance). ISGLT2: eficácia reduzida e contraindicado se TFG < 30.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Insulina NPH',false),
('B','Metformina (TFG < 30 mL/min)',true),
('C','Sitagliptina ajustada para a TFG',false),
('D','Liraglutida',false),
('E','Repaglinida',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Diabetes Mellitus' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'UNICAMP 2023',
'Em DM tipo 1 com hipoglicemia grave (paciente inconsciente, sem acesso venoso). Qual o tratamento de escolha?',
'Hipoglicemia grave (sem acesso venoso): glucagon IM ou SC (1 mg). Alternativa moderna: glucagon intrasnasal. Se acesso venoso disponível: glicose 50% IV (50 mL = 25g). Após recuperação, alimentar o paciente. Investigar causa da hipoglicemia (excesso de insulina, omissão de refeição, exercício, álcool).' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Insulina regular SC para estabilizar glicemia',false),
('B','Glicose oral se o paciente conseguir engolir',false),
('C','Glucagon IM ou SC 1 mg',true),
('D','Aguardar recuperação espontânea',false),
('E','Dextrose 5% IV 500 mL',false)) as alt(letra,texto,correta);

-- ================================================================
-- ENDOCRINOLOGIA > TIREOIDE (3 questões)
-- ================================================================

with sub as (select id from subtemas where nome='Tireoide' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2022',
'Mulher de 32 anos com tremor, palpitações, perda de peso e exoftalmia. TSH < 0,01 mUI/L, T4 livre elevado, anticorpos anti-receptor de TSH (TRAb) positivos. Qual o diagnóstico?',
'Doença de Graves: hipertireoidismo autoimune por anticorpos TRAb (estimulam receptor do TSH). Tríade clássica: hipertireoidismo + bócio difuso + oftalmopatia (exoftalmia). Tratamento: tionamidas (metimazol de preferência), radioiodoterapia (I-131) ou cirurgia (tireoidectomia). Betabloqueador para controle de sintomas.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Tireoidite de Hashimoto',false),
('B','Bócio multinodular tóxico',false),
('C','Doença de Graves',true),
('D','Adenoma tóxico de Plummer',false),
('E','Tireoidite subaguda de De Quervain',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Tireoide' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Nódulo tireoidiano solitário de 2,5 cm, sólido, hipoecogênico com microcalcificações à USG. PAAF: células foliculares atípicas (Bethesda IV). Qual a conduta?',
'Bethesda IV (neoplasia folicular): risco de malignidade 25-40%. Conduta: lobectomia diagnóstica (permite análise histológica completa). Se malignidade confirmada: completar tireoidectomia total. Características suspeitas ao USG: hipoecogenicidade, microcalcificações, margens irregulares, vascularização central aumentada, maior em altura do que largura (ACR-TIRADS).' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Repetir PAAF em 6 meses',false),
('B','Observação com USG anual',false),
('C','Lobectomia diagnóstica',true),
('D','Radioiodoterapia I-131',false),
('E','Supressão com levotiroxina e reavaliação',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Tireoide' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2023',
'Hipotireoidismo primário: qual o exame mais sensível para diagnóstico e o objetivo do tratamento com levotiroxina?',
'TSH é o exame mais sensível para hipotireoidismo primário (eleva-se antes de T4 cair). Diagnóstico: TSH elevado + T4 livre baixo (hipotireoidismo clínico) ou TSH elevado + T4 livre normal (hipotireoidismo subclínico). Tratamento: levotiroxina com meta de TSH 0,5-2,5 mUI/L. Tomar em jejum, 30-60 min antes do café.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','T3 livre; normalizar T3 > 200 ng/dL',false),
('B','TSH; manter TSH entre 0,5-2,5 mUI/L',true),
('C','T4 total; normalizar T4 total > 8 µg/dL',false),
('D','Anticorpo anti-TPO; negativar anticorpos',false),
('E','T4 livre; manter T4 > 1,5 ng/dL',false)) as alt(letra,texto,correta);

-- ================================================================
-- NEFROLOGIA > IRA (3 questões)
-- ================================================================

with sub as (select id from subtemas where nome='IRA' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Paciente pós-operatório com oligúria, creatinina de 0,8 para 2,4 mg/dL em 48h. FeNa = 0,3%. Qual o tipo de IRA e a conduta?',
'IRA pré-renal: hipoperfusão renal com rim intrinsecamente normal. FeNa < 1% (conserva sódio), osmolaridade urinária alta, ureia/creatinina > 40. Causa: desidratação, choque, ICC. Conduta: expansão volêmica. Se não responder → NTA (FeNa > 2%). Na IRA por contraste: FeNa < 1% nas primeiras horas.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','IRA intrínseca (NTA); diálise imediata',false),
('B','IRA pré-renal; expansão volêmica',true),
('C','IRA pós-renal; cateterismo vesical',false),
('D','IRA intrínseca (glomerulonefrite); biópsia renal',false),
('E','IRA pré-renal; furosemida IV para aumentar débito urinário',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='IRA' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Paciente com IRA oligúrica e hipercalemia grave: K+ = 6,8 mEq/L, alterações ao ECG (ondas T apiculadas). Qual a primeira medida a ser tomada?',
'Hipercalemia com ECG alterado: risco de arritmia fatal. Sequência: 1) Gluconato de cálcio IV (estabiliza membrana cardíaca, ação imediata em 1-3 min, não reduz K+). 2) Insulina + glicose (desloca K+ para intracelular). 3) Bicarbonato (se acidose). 4) Kayexalate ou patiromer (eliminação). 5) Diálise (casos graves refratários).' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Kayexalate oral (sulfonato de poliestireno)',false),
('B','Furosemida IV para aumentar excreção de K+',false),
('C','Gluconato de cálcio IV para estabilizar membrana cardíaca',true),
('D','Hemodiálise imediata',false),
('E','Bicarbonato de sódio IV como primeira medida',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='IRA' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2022',
'Paciente recebeu contraste iodado para angiotomografia. Qual a principal medida de nefroproteção para prevenir nefropatia por contraste?',
'Nefropatia por contraste: principal FR = IRC prévia + DM + desidratação. Nefroproteção: hidratação IV com SF 0,9% (1 mL/kg/h por 6-12h antes e após) é a única com eficácia comprovada. N-acetilcisteína: benefício incerto. Usar menor dose de contraste iso-osmolar. Suspender metformina 48h antes e após (risco de acidose lática).' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','N-acetilcisteína oral como única medida',false),
('B','Hidratação IV com SF 0,9% antes e após o exame',true),
('C','Furosemida profilática para aumentar diurese',false),
('D','Hemodiálise preventiva logo após o contraste',false),
('E','Bicarbonato de sódio IV como única medida',false)) as alt(letra,texto,correta);

-- ================================================================
-- REUMATOLOGIA > LES (4 questões)
-- ================================================================

with sub as (select id from subtemas where nome='LES' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Mulher de 28 anos com artrite, rash malar, fotossensibilidade, alopecia e leucopenia. FAN 1:640 padrão homogêneo. Qual o anticorpo mais específico para LES?',
'Anti-DNA dupla-fita (anti-dsDNA): anticorpo mais específico para LES (especificidade > 95%), correlaciona com atividade da doença, especialmente nefrite lúpica. FAN: muito sensível mas pouco específico. Anti-Sm: alta especificidade (quase patognomônico) mas baixa sensibilidade. Anti-Ro/La: associado a lúpus neonatal e SS.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','FAN (fator antinuclear)',false),
('B','Anti-DNA dupla-fita (anti-dsDNA)',true),
('C','Fator reumatoide',false),
('D','Anti-CCP',false),
('E','ANCA-c',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='LES' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Paciente com LES e nefrite lúpica classe IV (biópsia). Qual o esquema de indução de remissão?',
'Nefrite lúpica classe IV (proliferativa difusa): mais grave, risco de IRC. Indução: micofenolato de mofetila (MMF) OU ciclofosfamida IV (protocolo NIH ou Euro-Lupus) + metilprednisolona em pulso → prednisona. MMF preferido pela menor toxicidade. Manutenção: MMF ou azatioprina + hidroxicloroquina.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','AINEs + prednisona oral baixa dose',false),
('B','Metilprednisolona em pulso + micofenolato de mofetila ou ciclofosfamida',true),
('C','Hidroxicloroquina isolada',false),
('D','Rituximabe como primeira linha',false),
('E','Azatioprina isolada',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='LES' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2022',
'Paciente com LES e trombose venosa de repetição, trombocitopenia e abortos espontâneos recorrentes. Qual a síndrome associada e o tratamento?',
'Síndrome antifosfolípide (SAF): trombose arterial/venosa + abortos + anticorpos antifosfolípides (anticardiolipina, anti-β2GPI, anticoagulante lúpico). Tratamento: trombose venosa → warfarina (INR 2-3). Trombose arterial → warfarina com INR alvo 3-4. SAF obstétrica: AAS + heparina na gestação.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Trombocitopenia imune; IGIV',false),
('B','Síndrome antifosfolípide; warfarina (INR 2-3) para trombose venosa',true),
('C','Púrpura trombocitopênica trombótica; plasmaférese',false),
('D','CIVD; heparina de baixo peso molecular',false),
('E','Síndrome de Evans; rituximabe',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='LES' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2021',
'Qual medicamento é recomendado para todos os pacientes com LES, independentemente da atividade da doença?',
'Hidroxicloroquina (HCQ): indicada para todos os pacientes com LES. Benefícios: reduz flares, dano orgânico, trombose, dislipidemia e mortalidade. Rastreio oftalmológico anual após 5 anos de uso (risco de maculopatia). Dose: 5 mg/kg/dia de peso real.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Prednisona em baixa dose',false),
('B','Azatioprina',false),
('C','Hidroxicloroquina',true),
('D','Metotrexato',false),
('E','Ciclofosfamida',false)) as alt(letra,texto,correta);

-- ================================================================
-- HEMATOLOGIA > ANEMIAS (4 questões)
-- ================================================================

with sub as (select id from subtemas where nome='Anemias' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Mulher de 30 anos com fadiga, palidez, queilite angular e coiloníquia. Hb = 8,5 g/dL, VCM = 65 fL, CHCM baixo, RDW alto, ferritina = 4 ng/mL. Qual o diagnóstico e a causa mais comum em mulheres jovens?',
'Anemia ferropriva: microcítica hipocrômica + ferritina baixa (melhor indicador de estoques). Sinais clínicos: coiloníquia (unhas em colher), queilite angular, glossite, síndrome de Plummer-Vinson. Causa mais comum em mulheres jovens: perda menstrual. Tratamento: sulfato ferroso VO por 3-6 meses após normalização da Hb.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Anemia de doença crônica; tratar doença de base',false),
('B','Anemia ferropriva; perda menstrual como causa mais comum',true),
('C','Talassemia minor; nenhum tratamento',false),
('D','Anemia sideroblástica; piridoxina',false),
('E','Anemia megaloblástica; vitamina B12 IM',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Anemias' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Idoso de 72 anos com anemia macrocítica (VCM = 115 fL), glossite, parestesias nos membros e reflexos diminuídos. B12 = 95 pg/mL. Qual a causa mais provável e o tratamento?',
'Anemia por deficiência de B12: macrocítica + manifestações neurológicas (degeneração combinada subaguda da medula: parestesias, ataxia, reflexos alterados). Causa mais comum em idosos: gastrite atrófica autoimune (anemia perniciosa, anticorpos anti-fator intrínseco). Tratamento: cianocobalamina IM (1000 µg/d × 7d, depois semanal × 1 mês, depois mensal).' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Deficiência de folato; ácido fólico VO',false),
('B','Deficiência de vitamina B12 (anemia perniciosa); B12 IM',true),
('C','Anemia ferropriva; sulfato ferroso',false),
('D','Síndrome mielodisplásica; transfusão',false),
('E','Hipotireoidismo; levotiroxina',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Anemias' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2022',
'Criança de 8 anos, negro, com crise álgica, anemia hemolítica e esplenomegalia. Eletroforese: HbS 88%, HbF 10%, HbA2 2%. Qual a complicação mais grave na infância?',
'Anemia falciforme (HbSS): principal complicação na infância → síndrome torácica aguda (STA): dor torácica + infiltrado pulmonar + febre = urgência médica. Crise álgica vaso-oclusiva: mais frequente. Sequestro esplênico: esplenomegalia aguda + queda brusca da Hb (criança pequena). AVC: principal neurológico.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Crise aplásica por parvovírus B19',false),
('B','Síndrome torácica aguda',true),
('C','Colecistite por cálculo biliar de bilirrubinato',false),
('D','Priapismo',false),
('E','Úlcera de membros inferiores',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Anemias' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2022',
'Qual a tríade da anemia hemolítica microangiopática (PTT/SHU)?',
'PTT (púrpura trombocitopênica trombótica): pentade = anemia hemolítica microangiopática + trombocitopenia + neurológico + renal + febre. SHU: tríade = anemia hemolítica microangiopática + trombocitopenia + insuficiência renal aguda (mais em crianças, E. coli O157:H7). Schistócitos no esfregaço. Tratamento PTT: plasmaférese urgente.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Anemia + esplenomegalia + icterícia',false),
('B','Anemia hemolítica microangiopática + trombocitopenia + insuficiência renal aguda',true),
('C','Anemia + coagulopatia + disfunção hepática',false),
('D','Pancitopenia + febre + adenomegalia',false),
('E','Hemoglobinúria + hemossiderinúria + trombose',false)) as alt(letra,texto,correta);

-- ================================================================
-- GASTROENTEROLOGIA > FÍGADO (4 questões)
-- ================================================================

with sub as (select id from subtemas where nome='Fígado' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Cirrótico descompensado com ascite volumosa, febre, dor abdominal e líquido ascítico com PMN = 350 células/mm³. Qual o diagnóstico e o tratamento?',
'Peritonite bacteriana espontânea (PBE): PMN no líquido ascítico ≥ 250 células/mm³ sem foco cirúrgico. Tratamento: cefotaxima IV 2g 8/8h por 5-7 dias (primeira linha). Albumina IV (1,5 g/kg no D1, 1 g/kg no D3) previne síndrome hepatorrenal. Profilaxia secundária: norfloxacina VO indefinidamente.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Ascite não complicada; furosemida + espironolactona',false),
('B','PBE; cefotaxima IV + albumina IV',true),
('C','Tuberculose peritoneal; RHZE',false),
('D','Carcinomatose peritoneal; paracentese de alívio',false),
('E','PBE; ciprofloxacina oral ambulatorial',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Fígado' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Paciente com cirrose Child-Pugh C e hemorragia digestiva alta por varizes esofágicas. Qual a conduta inicial?',
'Varizes esofágicas sangrantes: ABC + acesso venoso calibroso. Drogas vasoativas: terlipressina ou octreotida IV (reduz fluxo portal). Profilaxia antibiótica: norfloxacina ou ceftriaxona (reduz infecção + ressangramento). Endoscopia (bandas elásticas) em até 12h após estabilização. Balão de Sengstaken: resgate. TIPS: refratário.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Endoscopia imediata sem preparo + escleroterapia',false),
('B','Terlipressina/octreotida IV + antibiótico profilático + endoscopia em até 12h',true),
('C','Vitamina K IV + plasma fresco congelado imediato',false),
('D','IBP em dose plena + endoscopia eletiva',false),
('E','Transfusão até Hb > 10 g/dL antes de qualquer outra conduta',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Fígado' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2022',
'Hepatite B: paciente com HBsAg+ há 6 meses, HBeAg positivo, DNA-VHB = 2.000.000 UI/mL, ALT = 3x LSN, biópsia com fibrose F3. Qual a conduta?',
'Hepatite B crônica: indicação de tratamento quando há atividade viral alta (DNA > 2000 UI/mL) + ALT elevada + fibrose significativa (F2-F4). Primeira linha: tenofovir (TDF ou TAF) ou entecavir (potentes, baixa resistência). Interferon peguilado: opção em jovens com possibilidade de soroconversão, mas com mais efeitos adversos.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Observação; tratar apenas se cirrose estabelecida',false),
('B','Tenofovir ou entecavir (antivirais de primeira linha)',true),
('C','Lamivudina em monoterapia',false),
('D','Interferon peguilado obrigatório',false),
('E','Transplante hepático imediato',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Fígado' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2022',
'Cirrótico com confusão mental, asterixis e febre após sangramento digestivo. Amônia elevada. Qual o diagnóstico e o tratamento?',
'Encefalopatia hepática (EH): precipitada por sangramento GI, infecção, constipação, uso de sedativos. Tratamento: tratar fator precipitante + lactulose oral/enema (objetivo: 2-3 evacuações/dia) + rifaximina (reduz bactérias produtoras de amônia). Restrição proteica severa: não mais recomendada.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Meningite; ceftriaxona IV',false),
('B','Encefalopatia hepática; tratar precipitante + lactulose + rifaximina',true),
('C','Hipoglicemia; glicose IV',false),
('D','Intoxicação por benzodiazepínico; flumazenil',false),
('E','Encefalopatia hepática; dieta sem proteína por 7 dias',false)) as alt(letra,texto,correta);

-- ================================================================
-- OBSTETRÍCIA > SÍNDROMES HIPERTENSIVAS (3 questões)
-- ================================================================

with sub as (select id from subtemas where nome='Síndromes Hipertensivas' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Gestante de 34 semanas com PA = 158/102 mmHg, proteinúria 3+, edema facial e cefaleia intensa. Qual o diagnóstico e o anti-hipertensivo de escolha?',
'Pré-eclâmpsia grave: PA ≥ 160/110 mmHg + sintomas graves (cefaleia, escotomas, dor epigástrica) ou proteinúria significativa após 20 semanas. Anti-hipertensivos na gestação: hidralazina IV (primeira linha para crise), labetalol IV ou nifedipina VO. Contraindicados: IECA, BRA, nitroprussiato (2º e 3º trim), atenolol.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Hipertensão gestacional; captopril VO',false),
('B','Pré-eclâmpsia grave; hidralazina IV ou nifedipina VO',true),
('C','Eclâmpsia; sulfato de magnésio + diazepam',false),
('D','Síndrome HELLP; corticoide e alta hospitalar',false),
('E','Pré-eclâmpsia leve; metoprolol VO',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Síndromes Hipertensivas' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Gestante com pré-eclâmpsia grave inicia convulsão tônico-clônica generalizada. Qual a conduta imediata?',
'Eclâmpsia = convulsão em gestante com pré-eclâmpsia. Conduta: sulfato de magnésio IV (dose de ataque: 4-6g em 15-20 min; manutenção: 1-2g/h). MgSO4 é superior aos anticonvulsivantes clássicos (benzodiazepínicos). Monitorar toxicidade: abolição do reflexo patelar (Mg 7-10 mEq/L), oligúria, FR < 12 irpm. Antídoto: gluconato de cálcio IV.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Diazepam IV como anticonvulsivante de escolha',false),
('B','Sulfato de magnésio IV (ataque + manutenção)',true),
('C','Fenitoína IV',false),
('D','Fenobarbital IM',false),
('E','Levetiracetam IV',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Síndromes Hipertensivas' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2022',
'Gestante de 32 semanas com pré-eclâmpsia grave e síndrome HELLP. Qual a tríade que define HELLP?',
'Síndrome HELLP: Hemolysis (anemia hemolítica microangiopática, schistócitos, LDH elevado) + Elevated Liver enzymes (TGO/TGP elevadas) + Low Platelets (plaquetas < 100.000). Grave complicação da pré-eclâmpsia. Tratamento definitivo: resolução da gestação (parto). Corticoide para maturação pulmonar fetal se < 34 semanas.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Hipertensão + proteinúria + edema',false),
('B','Hemólise + enzimas hepáticas elevadas + plaquetopenia',true),
('C','Convulsão + coagulopatia + IRA',false),
('D','Anemia + leucocitose + trombocitose',false),
('E','Icterícia + ascite + encefalopatia',false)) as alt(letra,texto,correta);

-- ================================================================
-- PEDIATRIA > DOENÇAS EXANTEMÁTICAS (3 questões)
-- ================================================================

with sub as (select id from subtemas where nome='Doenças Exantemáticas' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2022',
'Criança de 5 anos com febre alta há 3 dias, tosse, coriza, conjuntivite e exantema morbiliforme que começou na face e se disseminou craniocaudalmente. Qual o diagnóstico e a medida profilática?',
'Sarampo: pródromo 3 K (Koplik, Koriza, Konjuntivite) + febre alta + exantema morbiliforme craniocaudal. Sinal de Koplik: manchas brancas na mucosa bucal (patognomônico). Profilaxia: vacina SCR/SCRV (tríplice/tetravalente viral). Complicações: pneumonia, encefalite.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Rubéola; imunoglobulina',false),
('B','Sarampo; vacina SCR (tríplice viral) como profilaxia',true),
('C','Varicela; aciclovir VO',false),
('D','Escarlatina; penicilina V VO',false),
('E','Exantema súbito (roséola); observação',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Doenças Exantemáticas' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Criança de 3 anos com febre de 40°C por 3 dias que desaparece subitamente, seguida de exantema róseo no tronco. Qual o diagnóstico e o agente causador?',
'Exantema súbito (roséola infantum/6ª doença): febre alta + desaparecimento da febre → exantema maculopapular róseo no tronco (rash aparece quando febre cessa). Agente: HHV-6 (herpesvírus humano 6), mais raro HHV-7. Mais comum entre 6 meses e 2 anos. Benigno e autolimitado.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Sarampo; paramixovírus',false),
('B','Rubéola; togavírus',false),
('C','Exantema súbito; HHV-6',true),
('D','Varicela; VZV',false),
('E','Escarlatina; Streptococcus pyogenes',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Doenças Exantemáticas' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2022',
'Criança com febre, odinofagia, exantema micropapular "lixa" no tronco, palidez perioral e sinal de Pastia. Qual o diagnóstico e o tratamento?',
'Escarlatina: infecção por S. pyogenes beta-hemolítico grupo A toxigênico. Exantema micropapular "lixa" + língua em framboesa + sinal de Pastia (petéquias nas dobras) + palidez perioral. Tratamento: penicilina V VO por 10 dias ou amoxicilina. Previne febre reumática e glomerulonefrite pós-estreptocócica.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Sarampo; vitamina A',false),
('B','Kawasaki; AAS + imunoglobulina IV',false),
('C','Escarlatina; penicilina V ou amoxicilina por 10 dias',true),
('D','Varicela; aciclovir VO',false),
('E','Dengue; hidratação oral + paracetamol',false)) as alt(letra,texto,correta);

-- ================================================================
-- CIRURGIA > TRAUMA (4 questões)
-- ================================================================

with sub as (select id from subtemas where nome='Trauma' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Vítima de acidente com múltiplos traumas. PA = 80/50 mmHg, FC = 130 bpm, Glasgow 14, extremidades frias. Segundo o ATLS, qual a primeira prioridade no atendimento?',
'ATLS — primário: A-B-C-D-E. A (Airway/via aérea com controle cervical): primeira prioridade absoluta. Sem via aérea pérvia → morte em minutos. Manobra jaw-thrust, cânula orofaríngea, IOT se necessário. Somente após A garantido → B (respiração), C (circulação/hemorragia), D (neurológico/Glasgow), E (exposição).' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Controle da hemorragia e acesso venoso imediato',false),
('B','Avaliação neurológica (Glasgow)',false),
('C','Garantia de via aérea pérvia com controle cervical (A)',true),
('D','Exposição completa para avaliar lesões',false),
('E','Glicemia e ECG imediatos',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Trauma' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Trauma torácico fechado com dispneia súbita, desvio de traqueia contralateral, ausência de MV unilateral e hipotensão. Qual o diagnóstico e a conduta imediata?',
'Pneumotórax hipertensivo: emergência — não aguardar RX! Tríade: desvio de traqueia contralateral + ausência de MV + hipotensão/distensão jugular. Conduta imediata: descompressão com agulha grossa (14G) no 2º espaço intercostal na linha hemiclavicular. Depois: drenagem em selo d''água.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','RX de tórax urgente para confirmar antes de tratar',false),
('B','Descompressão imediata com agulha grossa (2º EIC, LMC)',true),
('C','Pericardiocentese por suspeita de tamponamento',false),
('D','IOT imediata + ventilação com pressão positiva',false),
('E','Drenagem torácica em selo d''água como primeiro passo',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Trauma' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2022',
'Trauma abdominal fechado. FAST positivo (líquido livre no abdome). PA = 70/40 mmHg, FC = 140 bpm, sem resposta à ressuscitação volêmica. Qual a conduta?',
'FAST positivo + instabilidade hemodinâmica refratária à ressuscitação = cirurgia de emergência (laparotomia exploradora) imediata. Não há tempo para TC. O objetivo é damage control surgery: controlar hemorragia + contaminação, fechar temporariamente. TC abdominal é para pacientes estáveis.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','TC de abdome urgente para melhor avaliação das lesões',false),
('B','Laparotomia exploradora de emergência imediata',true),
('C','Arteriografia + embolização',false),
('D','Continuar ressuscitação volêmica agressiva',false),
('E','FAST seriado a cada 30 minutos',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Trauma' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2022',
'Pelo ATLS, qual a classificação do choque hemorrágico em que o paciente apresenta FC = 120, PA normal, FR = 22, ansiedade e perda estimada de 1.200 mL?',
'Choque classe II: perda de 750-1500 mL (15-30% da volemia). FC 100-120 bpm, PA normal (VC compensado), FR 20-30 irpm, ansiedade, débito urinário 20-30 mL/h. Tratamento: cristaloide IV. Classe III (1500-2000 mL, 30-40%): PA cai, confusão. Classe IV (> 2000 mL, > 40%): risco de vida imediato.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Classe I (< 750 mL)',false),
('B','Classe II (750-1500 mL)',true),
('C','Classe III (1500-2000 mL)',false),
('D','Classe IV (> 2000 mL)',false),
('E','Choque neurogênico',false)) as alt(letra,texto,correta);

-- ================================================================
-- PREVENTIVA > SUS (3 questões)
-- ================================================================

with sub as (select id from subtemas where nome='SUS' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Quais são os princípios doutrinários do SUS estabelecidos pela Constituição Federal de 1988 e pela Lei 8.080/90?',
'Princípios doutrinários do SUS: Universalidade (acesso de todos), Equidade (tratar desiguais de forma desigual, conforme necessidade) e Integralidade (atenção a todas as necessidades, promoção + prevenção + cura + reabilitação). Princípios organizativos: descentralização, regionalização, hierarquização e participação da comunidade.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Universalidade, igualdade e integralidade',false),
('B','Universalidade, equidade e integralidade',true),
('C','Gratuidade, hierarquização e descentralização',false),
('D','Regionalização, hierarquização e participação comunitária',false),
('E','Acessibilidade, resolutividade e participação social',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='SUS' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Qual é o modelo de atenção primária à saúde no Brasil e qual a equipe mínima da Estratégia de Saúde da Família (ESF)?',
'ESF (Estratégia Saúde da Família): modelo de reorientação da atenção básica, porta de entrada do SUS. Equipe mínima: 1 médico generalista/MFC + 1 enfermeiro + 1 técnico/auxiliar de enfermagem + 4-6 Agentes Comunitários de Saúde (ACS). Cada equipe é responsável por 2000-3500 pessoas (máximo 4000).' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','UPA 24h; médico, enfermeiro e farmacêutico',false),
('B','ESF; médico + enfermeiro + téc. enfermagem + ACS',true),
('C','CAPS; psiquiatra + psicólogo + assistente social',false),
('D','NASF; fisioterapeuta + nutricionista + fonoaudiólogo',false),
('E','CEO; cirurgião-dentista + auxiliar de saúde bucal',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='SUS' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'FMUSP 2022',
'O que é o COAP (Contrato Organizativo da Ação Pública de Saúde) e em qual decreto foi regulamentado?',
'COAP: instrumento de gestão do SUS que formaliza acordos entre os entes federados (União, estados, DF e municípios) definindo responsabilidades, indicadores e metas de saúde. Regulamentado pelo Decreto 7.508/2011, que regulamenta a Lei 8.080/90 e organiza as Regiões de Saúde, Redes de Atenção à Saúde e o COAP.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Plano de financiamento federal; Lei 8.142/90',false),
('B','Instrumento de gestão entre entes federados; Decreto 7.508/2011',true),
('C','Contrato de metas hospitalares; Portaria MS 1.559/2008',false),
('D','Acordo de cooperação técnica internacional; Lei 9.961/2000',false),
('E','Regulamentação dos planos de saúde privados; Lei 9.656/98',false)) as alt(letra,texto,correta);

-- ================================================================
-- EPILEPSIA (2 questões)
-- ================================================================

with sub as (select id from subtemas where nome='Epilepsia' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2022',
'Paciente com convulsão tônico-clônica generalizada há 35 minutos sem recuperar consciência. Já recebeu 2 doses de diazepam sem resposta. Qual o diagnóstico e a próxima conduta?',
'Estado de mal epiléptico (EME): convulsão > 5 min ou 2 crises sem recuperação. Fase 1 (0-5 min): benzodiazepínico (diazepam IV, midazolam IM ou lorazepam IV). Fase 2 (BDZ falhou): fenitoína IV, ácido valproico IV ou levetiracetam IV. Fase 3 (refratário > 30 min): anestesia geral (midazolam, propofol ou tiopental) em UTI com EEG.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','3ª dose de diazepam',false),
('B','Estado de mal epiléptico; fenitoína IV ou ácido valproico IV',true),
('C','Glicose IV e aguardar resolução espontânea',false),
('D','Intubação imediata como primeira medida na fase 2',false),
('E','EEG urgente antes de qualquer nova medicação',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Epilepsia' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Mulher de 25 anos com epilepsia em uso de ácido valproico que deseja engravidar. Qual a orientação correta?',
'Ácido valproico na gestação: alto risco de malformações fetais (espinha bífida, defeitos do tubo neural) e neurotoxicidade fetal. Deve ser EVITADO na gravidez se possível. Alternativas mais seguras: lamotrigina ou levetiracetam. Ácido fólico 5 mg/dia (dose alta) deve ser prescrito a todas as epilépticas que desejam engravidar, preferencialmente 3 meses antes da concepção.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Suspender toda a medicação durante a gestação',false),
('B','Manter valproico + ácido fólico 0,4 mg/dia',false),
('C','Trocar para lamotrigina ou levetiracetam + ácido fólico 5 mg/dia',true),
('D','Trocar para fenitoína que é segura na gestação',false),
('E','Contraindicar a gestação em epilépticas',false)) as alt(letra,texto,correta);

-- ================================================================
-- INFECTOLOGIA > HEPATITES (2 questões)
-- ================================================================

with sub as (select id from subtemas where nome='Hepatites' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'REVALIDA 2023',
'Paciente com hepatite aguda, IgM anti-HBc positivo, HBsAg positivo, HBeAg positivo, IgM anti-HAV negativo. Como interpretar?',
'Hepatite B aguda: HBsAg+ (infecção ativa) + IgM anti-HBc+ (infecção aguda recente — 6 meses). HBeAg+: alta replicação viral. Anti-HBs: surge na cura/vacinação. Anti-HBc IgG: contato prévio (passado ou crônico). HBsAg+ > 6 meses = hepatite B crônica.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Hepatite A aguda',false),
('B','Hepatite B crônica em reativação',false),
('C','Hepatite B aguda com alta replicação viral',true),
('D','Imunização prévia contra hepatite B',false),
('E','Hepatite B resolvida (cura)',false)) as alt(letra,texto,correta);

with sub as (select id from subtemas where nome='Hepatites' limit 1),
q as (insert into questoes(subtema_id,origem,enunciado,comentario) select sub.id,'USP 2022',
'Hepatite C: qual o esquema de tratamento atual de primeira linha e a meta do tratamento?',
'Hepatite C: tratamento com AAD (agentes antivirais de ação direta) — sofosbuvir + daclatasvir (disponível no SUS) ou sofosbuvir/ledipasvir ou sofosbuvir/velpatasvir, por 8-12 semanas. Taxa de cura (RVS — resposta virológica sustentada) > 95%. Meta: RNA-VHC indetectável 12 semanas após o fim do tratamento (RVS12). Cura microbiológica leva à regressão da fibrose.' from sub returning id)
insert into alternativas(questao_id,letra,texto,correta) select q.id,letra,texto,correta from q,(values
('A','Interferon peguilado + ribavirina por 48 semanas',false),
('B','Agentes antivirais de ação direta (sofosbuvir + daclatasvir); RVS > 95%',true),
('C','Tenofovir isolado por 12 semanas',false),
('D','Prednisona para controle da inflamação hepática',false),
('E','Transplante hepático como única opção curativa',false)) as alt(letra,texto,correta);

