-- Insert demo entities (fixing ARRAY[] cast)
INSERT INTO public.entities (id, tipo, nome_legal, nif, provincia, municipio, certificacoes, eudr_compliant) VALUES
('11111111-1111-1111-1111-111111111111', 'produtor', 'Cooperativa Café Huambo', '5417890123', 'Huambo', 'Caála', ARRAY['UTZ', 'Rainforest Alliance'], true),
('22222222-2222-2222-2222-222222222222', 'produtor', 'Fazenda São José', '5417890124', 'Benguela', 'Cubal', ARRAY['Orgânico'], true),
('33333333-3333-3333-3333-333333333333', 'cooperativa', 'Associação Produtores Bié', '5417890125', 'Bié', 'Kuito', ARRAY['FairTrade'], false),
('44444444-4444-4444-4444-444444444444', 'processador', 'Café Angola Processing SA', '5417890126', 'Luanda', 'Luanda', ARRAY[]::TEXT[], true),
('55555555-5555-5555-5555-555555555555', 'exportador', 'Angola Coffee Exports Lda', '5417890127', 'Luanda', 'Luanda', ARRAY['EUDR_ready'], true);

-- Insert demo explorations with realistic Angola coordinates
INSERT INTO public.exploracoes (id, produtor_id, designacao, area_ha, provincia, municipio, comuna, latitude, longitude, altitude_m, status, validado_at) VALUES
('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Fazenda Planalto Central', 45.5, 'Huambo', 'Caála', 'Catata', -12.8522, 15.5581, 1700, 'validado', NOW()),
('e2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Quinta do Monte Verde', 32.0, 'Huambo', 'Caála', 'Catata', -12.8711, 15.5892, 1650, 'validado', NOW()),
('e3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Fazenda São José', 67.3, 'Benguela', 'Cubal', 'Cubal', -12.8333, 14.9167, 1450, 'validado', NOW()),
('e4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Cooperativa Bié Norte', 120.0, 'Bié', 'Kuito', 'Kuito', -12.3833, 16.9333, 1700, 'pendente', NULL),
('e5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Exploração Experimental', 15.2, 'Huambo', 'Huambo', 'Huambo', -12.7767, 15.7389, 1721, 'validado', NOW());

-- Insert demo parcels
INSERT INTO public.parcelas (exploracao_id, codigo_parcela, area_ha, varietais, ano_plantio, praticas_agricolas, sombra_percent, irrigacao) VALUES
('e1111111-1111-1111-1111-111111111111', 'P001', 15.0, ARRAY['Arabica Bourbon'], 2018, ARRAY['Compostagem', 'Controlo biológico'], 40, false),
('e1111111-1111-1111-1111-111111111111', 'P002', 18.5, ARRAY['Arabica Catuaí'], 2019, ARRAY['Compostagem'], 35, false),
('e2222222-2222-2222-2222-222222222222', 'P001', 20.0, ARRAY['Arabica Bourbon', 'Arabica Mundo Novo'], 2017, ARRAY['Adubação orgânica'], 45, true),
('e3333333-3333-3333-3333-333333333333', 'P001', 35.0, ARRAY['Robusta'], 2016, ARRAY['Controlo integrado'], 30, false),
('e5555555-5555-5555-5555-555555555555', 'EXP01', 8.0, ARRAY['Arabica Geisha'], 2020, ARRAY['Experimental'], 50, true);

-- Insert demo harvests (colheitas)
INSERT INTO public.colheitas (parcela_id, campanha, data_inicio, data_fim, volume_cereja_kg, metodo_colheita) VALUES
((SELECT id FROM public.parcelas WHERE codigo_parcela = 'P001' AND exploracao_id = 'e1111111-1111-1111-1111-111111111111'), '2024/25', '2024-05-01', '2024-07-15', 8500, 'manual'),
((SELECT id FROM public.parcelas WHERE codigo_parcela = 'P002' AND exploracao_id = 'e1111111-1111-1111-1111-111111111111'), '2024/25', '2024-05-10', '2024-07-20', 10200, 'manual'),
((SELECT id FROM public.parcelas WHERE codigo_parcela = 'P001' AND exploracao_id = 'e2222222-2222-2222-2222-222222222222'), '2024/25', '2024-04-25', '2024-07-10', 14300, 'manual'),
((SELECT id FROM public.parcelas WHERE codigo_parcela = 'P001' AND exploracao_id = 'e3333333-3333-3333-3333-333333333333'), '2024/25', '2024-06-01', '2024-08-30', 22000, 'mecanico');

-- Insert demo lotes (using auto-generated references and QR codes)
INSERT INTO public.lotes (colheita_id, tipo, volume_kg, humidade_percent, temperatura_c, defeitos_ppm, classificacao_sensorial, estado) VALUES
((SELECT id FROM public.colheitas LIMIT 1 OFFSET 0), 'cereja', 8500, 11.5, 22.0, 5, 84.5, 'aprovado'),
((SELECT id FROM public.colheitas LIMIT 1 OFFSET 1), 'cafe_verde', 1700, 12.0, 20.0, 8, 82.0, 'aprovado'),
((SELECT id FROM public.colheitas LIMIT 1 OFFSET 2), 'cafe_verde', 2400, 11.8, 21.5, 4, 87.5, 'aprovado'),
((SELECT id FROM public.colheitas LIMIT 1 OFFSET 3), 'cereja', 22000, 13.5, 24.0, 15, NULL, 'pendente'),
(NULL, 'cafe_verde', 500, 10.5, 19.0, 2, 89.0, 'aprovado'),
(NULL, 'torrado', 350, 4.0, 25.0, 1, 85.0, 'aprovado'),
(NULL, 'cereja', 1200, 14.0, 23.0, 20, NULL, 'pendente'),
(NULL, 'cafe_verde', 800, 12.5, 21.0, 10, 78.5, 'reprovado');

-- Insert demo secagens
INSERT INTO public.secagens (lote_id, metodo, data_inicio, data_fim, tempo_total_h, temp_media_c, humidade_final_percent, notas) VALUES
((SELECT id FROM public.lotes LIMIT 1 OFFSET 0), 'terreiro', '2024-05-15', '2024-05-30', 360, 28.5, 11.5, 'Secagem uniforme, condições ideais'),
((SELECT id FROM public.lotes LIMIT 1 OFFSET 1), 'estufa', '2024-05-20', '2024-05-27', 168, 45.0, 12.0, 'Secagem controlada'),
((SELECT id FROM public.lotes LIMIT 1 OFFSET 2), 'terreiro', '2024-05-01', '2024-05-18', 408, 29.0, 11.8, 'Excelente secagem natural');