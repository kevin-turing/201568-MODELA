import * as T from 'effect-ts';
import { TaggedEnum, WithGenerics } from 'effect-ts/Data.TaggedEnum';

export const RemoteDataURI = 'RemoteData';

export class RemoteData<E, A> extends TaggedEnum<{
  NotAsked: {};
  Pending: {};
  Failure: { error: E };
  Success: { data: A };
}> {
  static notAsked = <E, A>(): RemoteData<E, A> =>
    RemoteData.build({ _tag: 'NotAsked' });
  static pending = <E, A>(): RemoteData<E, A> =>
    RemoteData.build({ _tag: 'Pending' });
  static failure = <E, A>(error: E): RemoteData<E, A> =>
    RemoteData.build({ _tag: 'Failure', error });
  static success = <E, A>(data: A): RemoteData<E, A> =>
    RemoteData.build({ _tag: 'Success', data });

  // inspired by fromNullable in Elm
  static fromNullable = <E, A>(
    error: E,
    a: A | null | undefined
  ): RemoteData<E, A> =>
    a ? RemoteData.success(a) : RemoteData.failure(error);

  // inspired by fromResult in Elm
  static fromResult = <E, A>(result: T.Result<E, A>): RemoteData<E, A> =>
    result._tag === 'Failure'
      ? RemoteData.failure(result.error)
      : RemoteData.success(result.right);

  readonly [T.URI]: typeof RemoteDataURI;
  constructor() {
    super();
  }
}

export type RemoteData<E, A> = WithGenerics<
  typeof RemoteDataURI,
  RemoteData<E, A>
>;

// Define a type for your data
type User = {
  id: number;
  name: string;
};

// Define a type for potential errors
type FetchError = { message: string };

// Declare a variable to hold user data
const userData: RemoteData<FetchError, User> = RemoteData.notAsked();

// ... later, when fetching data:
const fetchData = T.effectAsync<unknown, FetchError, User>((cb) => {
  // Simulate an asynchronous fetch
  setTimeout(() => {
    const success = Math.random() < 0.5; // Simulate success or failure
    if (success) {
      cb(
        T.succeed({
          id: 1,
          name: 'John Doe',
        })
      );
    } else {
      cb(T.fail({ message: 'Failed to fetch user data' }));
    }
  }, 1000);
});

// Update userData based on the result of fetchData
userData = RemoteData.fromResult(fetchData);

// ... in your component:
if (userData._tag === 'Success') {
  // Access data safely: userData.data.name
} else if (userData._tag === 'Failure') {
  // Handle error: userData.error.message
} else if (userData._tag === 'Pending') {
  // Show a loading indicator
}
