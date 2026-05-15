import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Rect } from 'react-native-svg';
import { useTheme } from '../theme/useTheme';
import { MuscleHeatmapEntry } from '../api/progress';

interface Props {
  data: MuscleHeatmapEntry[];
  rangeDays: number;
}

type MuscleKey =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'quads'
  | 'calves'
  | 'back'
  | 'traps'
  | 'rear delts'
  | 'glutes'
  | 'hamstrings';

const FRONT_MUSCLES: MuscleKey[] = ['chest', 'shoulders', 'biceps', 'core', 'quads', 'calves'];
const BACK_MUSCLES: MuscleKey[] = ['traps', 'back', 'rear delts', 'triceps', 'glutes', 'hamstrings', 'calves'];

function intensityColor(entry: MuscleHeatmapEntry | undefined): string {
  if (!entry || entry.sets === 0) return '#cbd5e1';
  if (entry.volume === 0) return '#fde68a';
  if (entry.volume < 2000) return '#fcd34d';
  if (entry.volume < 5000) return '#fb923c';
  if (entry.volume < 10000) return '#f97316';
  return '#dc2626';
}

export function BodyHeatmap({ data, rangeDays }: Props) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const map = useMemo(() => {
    const m = new Map<string, MuscleHeatmapEntry>();
    for (const e of data) m.set(e.muscle, e);
    return m;
  }, [data]);

  const fillFor = (muscle: MuscleKey) => intensityColor(map.get(muscle));
  const onTap = (muscle: MuscleKey) => () => setSelected(muscle === selected ? null : muscle);

  const selectedEntry = selected ? map.get(selected) : null;
  const skin = '#e2e8f0';
  const stroke = colors.border;

  const gapMuscles = FRONT_MUSCLES.concat(BACK_MUSCLES)
    .filter((m, i, a) => a.indexOf(m) === i)
    .map((m) => ({ muscle: m, entry: map.get(m) }))
    .filter((x) => x.entry && x.entry.sets === 0 && x.entry.daysSinceLast != null && x.entry.daysSinceLast >= 7)
    .sort((a, b) => (b.entry!.daysSinceLast ?? 0) - (a.entry!.daysSinceLast ?? 0))
    .slice(0, 2);

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Muscle activity</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>last {rangeDays}d</Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
        {/* FRONT */}
        <Svg width={120} height={240} viewBox="0 0 120 240">
          <Circle cx={60} cy={18} r={14} fill={skin} stroke={stroke} strokeWidth={1} />
          <Rect x={54} y={30} width={12} height={10} fill={skin} stroke={stroke} strokeWidth={1} />
          <Ellipse cx={28} cy={50} rx={14} ry={11} fill={fillFor('shoulders')} stroke={stroke} strokeWidth={1} onPress={onTap('shoulders')} />
          <Ellipse cx={92} cy={50} rx={14} ry={11} fill={fillFor('shoulders')} stroke={stroke} strokeWidth={1} onPress={onTap('shoulders')} />
          <Rect x={32} y={56} width={26} height={36} rx={6} fill={fillFor('chest')} stroke={stroke} strokeWidth={1} onPress={onTap('chest')} />
          <Rect x={62} y={56} width={26} height={36} rx={6} fill={fillFor('chest')} stroke={stroke} strokeWidth={1} onPress={onTap('chest')} />
          <Ellipse cx={20} cy={78} rx={9} ry={16} fill={fillFor('biceps')} stroke={stroke} strokeWidth={1} onPress={onTap('biceps')} />
          <Ellipse cx={100} cy={78} rx={9} ry={16} fill={fillFor('biceps')} stroke={stroke} strokeWidth={1} onPress={onTap('biceps')} />
          <Ellipse cx={16} cy={108} rx={7} ry={14} fill={skin} stroke={stroke} strokeWidth={1} />
          <Ellipse cx={104} cy={108} rx={7} ry={14} fill={skin} stroke={stroke} strokeWidth={1} />
          <Rect x={40} y={96} width={40} height={48} rx={8} fill={fillFor('core')} stroke={stroke} strokeWidth={1} onPress={onTap('core')} />
          <Rect x={30} y={148} width={26} height={56} rx={10} fill={fillFor('quads')} stroke={stroke} strokeWidth={1} onPress={onTap('quads')} />
          <Rect x={64} y={148} width={26} height={56} rx={10} fill={fillFor('quads')} stroke={stroke} strokeWidth={1} onPress={onTap('quads')} />
          <Rect x={32} y={208} width={22} height={28} rx={8} fill={fillFor('calves')} stroke={stroke} strokeWidth={1} onPress={onTap('calves')} />
          <Rect x={66} y={208} width={22} height={28} rx={8} fill={fillFor('calves')} stroke={stroke} strokeWidth={1} onPress={onTap('calves')} />
        </Svg>

        {/* BACK */}
        <Svg width={120} height={240} viewBox="0 0 120 240">
          <Circle cx={60} cy={18} r={14} fill={skin} stroke={stroke} strokeWidth={1} />
          <Rect x={54} y={30} width={12} height={6} fill={skin} stroke={stroke} strokeWidth={1} />
          <Rect x={42} y={36} width={36} height={14} rx={4} fill={fillFor('traps')} stroke={stroke} strokeWidth={1} onPress={onTap('traps')} />
          <Ellipse cx={28} cy={54} rx={11} ry={9} fill={fillFor('rear delts')} stroke={stroke} strokeWidth={1} onPress={onTap('rear delts')} />
          <Ellipse cx={92} cy={54} rx={11} ry={9} fill={fillFor('rear delts')} stroke={stroke} strokeWidth={1} onPress={onTap('rear delts')} />
          <Rect x={32} y={50} width={56} height={50} rx={10} fill={fillFor('back')} stroke={stroke} strokeWidth={1} onPress={onTap('back')} />
          <Ellipse cx={20} cy={80} rx={9} ry={16} fill={fillFor('triceps')} stroke={stroke} strokeWidth={1} onPress={onTap('triceps')} />
          <Ellipse cx={100} cy={80} rx={9} ry={16} fill={fillFor('triceps')} stroke={stroke} strokeWidth={1} onPress={onTap('triceps')} />
          <Ellipse cx={16} cy={108} rx={7} ry={14} fill={skin} stroke={stroke} strokeWidth={1} />
          <Ellipse cx={104} cy={108} rx={7} ry={14} fill={skin} stroke={stroke} strokeWidth={1} />
          <Rect x={34} y={104} width={52} height={26} rx={10} fill={fillFor('glutes')} stroke={stroke} strokeWidth={1} onPress={onTap('glutes')} />
          <Rect x={30} y={134} width={26} height={68} rx={10} fill={fillFor('hamstrings')} stroke={stroke} strokeWidth={1} onPress={onTap('hamstrings')} />
          <Rect x={64} y={134} width={26} height={68} rx={10} fill={fillFor('hamstrings')} stroke={stroke} strokeWidth={1} onPress={onTap('hamstrings')} />
          <Rect x={32} y={206} width={22} height={28} rx={8} fill={fillFor('calves')} stroke={stroke} strokeWidth={1} onPress={onTap('calves')} />
          <Rect x={66} y={206} width={22} height={28} rx={8} fill={fillFor('calves')} stroke={stroke} strokeWidth={1} onPress={onTap('calves')} />
        </Svg>
      </View>

      {selectedEntry ? (
        <View
          style={{
            backgroundColor: colors.bg,
            borderRadius: 10,
            padding: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700', textTransform: 'capitalize' }}>
            {selectedEntry.muscle}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
            {selectedEntry.sets > 0
              ? `${selectedEntry.sets} sets · ${formatVol(selectedEntry.volume)} volume in last ${rangeDays}d`
              : `Not trained in last ${rangeDays}d`}
            {selectedEntry.daysSinceLast != null
              ? ` · last ${selectedEntry.daysSinceLast === 0 ? 'today' : `${selectedEntry.daysSinceLast}d ago`}`
              : ' · never logged'}
          </Text>
        </View>
      ) : gapMuscles.length > 0 ? (
        <View
          style={{
            backgroundColor: colors.warnMuted,
            borderRadius: 10,
            padding: 10,
            borderWidth: 1,
            borderColor: colors.warn,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>
            ⚠️ Skipped this week:{' '}
            {gapMuscles
              .map((g) => `${g.muscle} (${g.entry!.daysSinceLast}d)`)
              .join(', ')}
          </Text>
        </View>
      ) : (
        <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
          Tap a muscle group for details
        </Text>
      )}

      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textMuted, fontSize: 10 }}>less</Text>
        {['#cbd5e1', '#fcd34d', '#fb923c', '#f97316', '#dc2626'].map((c) => (
          <View
            key={c}
            style={{ width: 14, height: 10, borderRadius: 2, backgroundColor: c, borderWidth: 1, borderColor: stroke }}
          />
        ))}
        <Text style={{ color: colors.textMuted, fontSize: 10 }}>more</Text>
      </View>

      <Pressable onPress={() => setSelected(null)} style={{ alignSelf: 'center' }}>
        {selected ? (
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Clear selection</Text>
        ) : null}
      </Pressable>
    </View>
  );
}

function formatVol(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
}
