import { FC } from 'react'
import type { Member } from '@/types'
import { firstChar } from '@/utils/calcStats'

interface Props {
  member: Member
  size?: 'sm' | 'md' | 'lg'
}

const MemberAvatar: FC<Props> = ({ member, size = 'sm' }) => {
  const dim =
    size === 'sm' ? 'w-8 h-8 text-xs' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base'
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium ${dim}`}
      style={{ backgroundColor: member.lightColor, color: member.color }}
      title={member.name}
    >
      {firstChar(member.name)}
    </span>
  )
}

export default MemberAvatar
