import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { BASE_ENDPOINT } from 'src/constants';
import { lastValueFrom } from 'rxjs';
import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi();
// spotifyApi.setAccessToken(process.env.SPOTIFY_ACCESS);

@Injectable()
export class UserService {
  constructor(private httpService: HttpService) {}
  async getUser(accessToken: string) {
    const url = `${BASE_ENDPOINT}/playlists/3pgci2OObIyooCw4axdSAi?si=635b307f6fd748d7`;

    let res;
    try {
      res = await lastValueFrom(
        this.httpService.put(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: {
            name: 'test',
          },
        }),
      );
    } catch (error) {
      console.log(error);
    }

    return res.data;
  }

  // async getMe() {
  //   const user = await spotifyApi.getMe();
  //   function (data) {
  //     console.log('Some information about the authenticated user', data.body);
  //   },
  //   function (err) {
  //     console.log('Something went wrong!', err);
  //   },
  // );
  //   return user;
  // }
}
