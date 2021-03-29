import Mousetrap from 'mousetrap';
import { setupImageUploader } from '../lib/textarea-image-uploader';
import { markedWithSyntax } from '../lib/syntax-highlighting';
import { autocompleteUsers } from './user-autocomplete';

const SAVE_SHORTCUT = [ 'mod+enter' ];

const initializeForm = (usersForAutoComplete) => {
  watchBody();
  watchCommentToggles();
  toggleWrite();
  setupImageUploader('#comment_body');
  autocompleteUsers('.comment-textarea', usersForAutoComplete);

  Mousetrap.bind(SAVE_SHORTCUT, () => {
    const $form = $('.comment-form');
    $form.submit();
  });
};

const initializeNewComment = () => {
  const savedComment = getCommentFromLocalStorage();
  const body = $('.comment-textarea');
  body.val(savedComment);
};

function watchBody() {
  if (!window.location.pathname.endsWith('edit')) {
    const body = $('.comment-textarea');
    body.on('input', event => {
      saveCommentToLocalStorage(event);
    });
  }
}

function getCommentFromLocalStorage() {
  return localStorage.getItem('new-markdown-comment');
}

function saveCommentToLocalStorage(event) {
  localStorage.setItem('new-markdown-comment', event.target.value);
}

function clearSavedCommentChanges() {
  localStorage.removeItem('new-markdown-comment');
}

function watchCommentToggles() {
  const viewTextButton = $('.comment-preview-text-button');
  const viewPreviewButton = $('.comment-preview-markdown-button');

  viewTextButton.on('click', toggleWrite);
  viewPreviewButton.on('click', togglePreview);
}

function toggleWrite() {
  const viewTextButton = $('.comment-preview-text-button');
  const viewPreviewButton = $('.comment-preview-markdown-button');
  const commentTextArea = $('.comment-textarea');
  const commentPreview = $('.comment-preview');

  viewTextButton.addClass('comment-tab-button--active');
  viewPreviewButton.removeClass('comment-tab-button--active');
  commentPreview.removeClass('border-bottom');

  commentTextArea.css('display', 'block');
  commentPreview.attr('hidden', true);
}

function togglePreview() {
  updateMarkdownPreview();
  showMarkdownPreview();
}

function updateMarkdownPreview() {
  const value = $('.comment-textarea').val();
  const preview = $('.comment-preview');

  if (value.length) {
    const markdown = markedWithSyntax(value);
    preview.html(markdown);
  } else {
    preview.html('Your rendered markdown goes here');
  }
}

function showMarkdownPreview() {
  const viewTextButton = $('.comment-preview-text-button');
  const viewPreviewButton = $('.comment-preview-markdown-button');
  const commentTextArea = $('.comment-textarea');
  const commentPreview = $('.comment-preview');

  viewTextButton.removeClass('comment-tab-button--active');
  viewPreviewButton.addClass('comment-tab-button--active');
  commentPreview.addClass('border-bottom');

  commentTextArea.css('display', 'none');
  commentPreview.removeAttr('hidden');
}

function resetPreview() {
  const commentPreview = $('.comment-preview');
  commentPreview.html('');
  toggleWrite();
}

export const setupEditForm = (usersForAutoComplete) => {
  initializeForm(usersForAutoComplete);
};

export const setupNewForm = (usersForAutoComplete) => {
  initializeForm(usersForAutoComplete);
  initializeNewComment();

  $('.comment-form').on('submit', function(event) {
    event.preventDefault();
    const form = $(this);

    clearSavedCommentChanges();
    resetPreview();
  });
};
