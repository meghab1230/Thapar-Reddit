'use client'

import { Menu, Transition } from '@headlessui/react'
import { FaFlag, FaTrash } from 'react-icons/fa'
import { Fragment } from 'react'
import { useDeletePost } from '@/hooks/use-delete-post'
import { useFlagPost } from '@/hooks/use-flag-post'

interface FlagMenuProps {
  postId: string
  isAuthor: boolean
  isAdmin: boolean
}

const FlagMenu = ({ postId, isAuthor, isAdmin }: FlagMenuProps) => {
  const { deletePost, isLoading: isDeleting } = useDeletePost()
  const { flagPost, isLoading: isFlagging } = useFlagPost()

  const handleFlag = (flagType: string) => {
    flagPost({ postId, flagType })
  }

  const canDelete = isAuthor || isAdmin

  return (
    <div className="absolute top-2 right-2 z-50">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="flex items-center focus:outline-none">
            <FaFlag className="text-red-500 h-5 w-5 hover:text-red-600 transition-colors" />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1">
              {canDelete && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-red-100 text-red-900' : 'text-red-700'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2`}
                      onClick={() => deletePost(postId)}
                      disabled={isDeleting}
                    >
                      <FaTrash className="h-4 w-4" />
                      {isDeleting ? 'Deleting...' : isAdmin ? 'Delete as Admin' : 'Delete Post'}
                    </button>
                  )}
                </Menu.Item>
              )}
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    onClick={() => handleFlag('profanity')}
                    disabled={isFlagging}
                  >
                    {isFlagging ? 'Flagging...' : 'Profanity'}
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    onClick={() => handleFlag('rumor')}
                    disabled={isFlagging}
                  >
                    {isFlagging ? 'Flagging...' : 'Rumor'}
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    onClick={() => handleFlag('inappropriate')}
                    disabled={isFlagging}
                  >
                    {isFlagging ? 'Flagging...' : 'Inappropriate'}
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}

export default FlagMenu